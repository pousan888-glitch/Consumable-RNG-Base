/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, AlertTriangle, CheckCircle, HelpCircle, 
  Layers, Database, UserCheck, ShieldAlert, Download, QrCode, ClipboardCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { InventoryDB, ConsumableItem, Cabinet, Department, User, UserRole } from '../types.js';
import { apiFetch } from '../apiFallback.js';
import { translations } from '../localization.js';

interface AdminDashboardProps {
  db: InventoryDB;
  currentUser: User;
  onUpdateDB: (updatedFields: Partial<InventoryDB>) => Promise<void>;
  language?: 'th' | 'en';
}

type TabType = 'overview' | 'items' | 'cabinets' | 'departments' | 'users';

export default function AdminDashboard({ db, currentUser, onUpdateDB, language = 'th' }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TabType | null>(null);

  // Translation helper function
  const t = (key: keyof typeof translations['en'], replaces?: Record<string, string | number>) => {
    let text = translations[language][key] || translations['en'][key] || key;
    if (replaces) {
      Object.entries(replaces).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  // Stats
  const totalItems = db.items.length;
  const lowStockItems = db.items.filter(item => item.currentStock <= item.minThreshold);
  const totalCabinets = db.cabinets.length;
  const totalDepts = db.departments.length;
  const totalUsers = db.users.length;

  // Chart data
  const chartData = db.items.map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name,
    Current: item.currentStock,
    Previous: item.previousStock || 0,
    Minimum: item.minThreshold
  }));

  // Handlers for Items
  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData: any = {
      name: formData.get('name') as string,
      imageUrl: formData.get('imageUrl') as string || undefined,
      departmentId: formData.get('departmentId') as string,
      cabinetId: formData.get('cabinetId') as string,
      currentStock: Number(formData.get('currentStock')),
      minThreshold: Number(formData.get('minThreshold')),
      unit: formData.get('unit') as string,
    };

    if (editingItem && editingItem.id) {
      // Update
      const response = await apiFetch(`/api/items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser.email
        },
        body: JSON.stringify({ ...itemData, previousStock: editingItem.currentStock })
      });
      if (response.ok) {
        const updatedItem = await response.json();
        const updatedItems = db.items.map(item => item.id === editingItem.id ? updatedItem : item);
        await onUpdateDB({ items: updatedItems });
      }
    } else {
      // Create
      const response = await apiFetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser.email
        },
        body: JSON.stringify(itemData)
      });
      if (response.ok) {
        const newItem = await response.json();
        await onUpdateDB({ items: [...db.items, newItem] });
      }
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this consumable?')) {
      const response = await apiFetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'X-User-Email': currentUser.email }
      });
      if (response.ok) {
        await onUpdateDB({ items: db.items.filter(i => i.id !== itemId) });
      }
    }
  };

  // Handlers for Cabinets
  const handleSaveCabinet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cabData = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
    };

    if (editingItem && editingItem.id) {
      const response = await apiFetch(`/api/cabinets/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser.email
        },
        body: JSON.stringify(cabData)
      });
      if (response.ok) {
        const updatedCab = await response.json();
        await onUpdateDB({ cabinets: db.cabinets.map(c => c.id === editingItem.id ? updatedCab : c) });
      }
    } else {
      const response = await apiFetch('/api/cabinets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser.email
        },
        body: JSON.stringify(cabData)
      });
      if (response.ok) {
        const newCab = await response.json();
        await onUpdateDB({ cabinets: [...db.cabinets, newCab] });
      }
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteCabinet = async (id: string) => {
    if (confirm('Deleting this cabinet will delete/unassign all items inside it. Continue?')) {
      const response = await apiFetch(`/api/cabinets/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Email': currentUser.email }
      });
      if (response.ok) {
        await onUpdateDB({ 
          cabinets: db.cabinets.filter(c => c.id !== id),
          items: db.items.filter(i => i.cabinetId !== id) 
        });
      }
    }
  };

  // Handlers for Departments
  const handleSaveDept = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const deptData = { name: formData.get('name') as string };

    if (editingItem && editingItem.id) {
      const response = await apiFetch(`/api/departments/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser.email
        },
        body: JSON.stringify(deptData)
      });
      if (response.ok) {
        const updated = await response.json();
        await onUpdateDB({ departments: db.departments.map(d => d.id === editingItem.id ? updated : d) });
      }
    } else {
      const response = await apiFetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser.email
        },
        body: JSON.stringify(deptData)
      });
      if (response.ok) {
        const newDept = await response.json();
        await onUpdateDB({ departments: [...db.departments, newDept] });
      }
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteDept = async (id: string) => {
    if (confirm('Deleting this department will remove its consumables. Continue?')) {
      const response = await apiFetch(`/api/departments/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Email': currentUser.email }
      });
      if (response.ok) {
        await onUpdateDB({ 
          departments: db.departments.filter(d => d.id !== id),
          items: db.items.filter(i => i.departmentId !== id)
        });
      }
    }
  };

  // Handlers for Users
  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as UserRole,
      departmentId: formData.get('departmentId') as string || undefined,
    };

    if (editingItem && editingItem.id) {
      const response = await apiFetch(`/api/users/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser.email
        },
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        const updated = await response.json();
        await onUpdateDB({ users: db.users.map(u => u.id === editingItem.id ? updated : u) });
      }
    } else {
      const response = await apiFetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser.email
        },
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        const newUser = await response.json();
        await onUpdateDB({ users: [...db.users, newUser] });
      }
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteUser = async (id: string) => {
    const targetUser = db.users.find(u => u.id === id);
    if (targetUser?.email.toLowerCase() === 'pousan888@gmail.com') {
      alert('Cannot delete the main super admin!');
      return;
    }
    if (confirm(`Are you sure you want to delete user ${targetUser?.name}?`)) {
      const response = await apiFetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Email': currentUser.email }
      });
      if (response.ok) {
        await onUpdateDB({ users: db.users.filter(u => u.id !== id) });
      }
    }
  };

  const getDeptName = (id: string) => db.departments.find(d => d.id === id)?.name || 'Unassigned';
  const getCabName = (id: string) => db.cabinets.find(c => c.id === id)?.name || 'Unassigned';

  const triggerAddModal = (type: TabType) => {
    setModalType(type);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const triggerEditModal = (type: TabType, item: any) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div id="admin-dashboard-root" className="space-y-6">
      {/* Tab Navigation */}
      <div id="admin-tab-nav" className="flex flex-wrap border-b border-gray-200 gap-2">
        {(['overview', 'items', 'cabinets', 'departments', 'users'] as TabType[]).map((tab) => (
          <button
            key={tab}
            id={`btn-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 rounded-t-lg cursor-pointer ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {tab === 'overview' ? t('tab_overview') :
             tab === 'items' ? t('tab_items') :
             tab === 'cabinets' ? t('tab_cabinets') :
             tab === 'departments' ? t('tab_departments') :
             t('tab_users')}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div id="overview-tab-content" className="space-y-6 animate-fade-in">
          {/* Key Metrics Grid */}
          <div id="metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div id="metric-total-items" className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('stat_total_items')}</p>
                <p className="text-2xl font-semibold text-gray-800">{totalItems}</p>
              </div>
            </div>

            <div id="metric-low-stock" className={`bg-white p-5 rounded-xl border shadow-xs flex items-center space-x-4 ${lowStockItems.length > 0 ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100'}`}>
              <div className={`p-3 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-400'}`}>
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('stat_low_stock')}</p>
                <p className={`text-2xl font-semibold ${lowStockItems.length > 0 ? 'text-amber-700 font-bold' : 'text-gray-800'}`}>{lowStockItems.length}</p>
              </div>
            </div>

            <div id="metric-cabinets" className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('stat_total_cabinets')}</p>
                <p className="text-2xl font-semibold text-gray-800">{totalCabinets}</p>
              </div>
            </div>

            <div id="metric-users" className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center space-x-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('stat_total_users')}</p>
                <p className="text-2xl font-semibold text-gray-800">{totalUsers}</p>
              </div>
            </div>
          </div>

          {/* Alert Alerts Section */}
          {lowStockItems.length > 0 && (
            <div id="stock-alerts-banner" className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm">{t('err_low_stock_alert')}</h4>
                  <p className="text-xs text-amber-700">The following items have dropped below their minimum safe thresholds. Field counts require attention.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <span key={item.id} className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                    {item.name}: <span className="font-bold">{item.currentStock}</span>/{item.minThreshold} {item.unit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Main Visualizations */}
          <div id="charts-and-recent" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div id="chart-panel" className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-xs truncate max-w-lg">{t('chart_title')}</h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Previous" fill="#94a3b8" radius={[4, 4, 0, 0]} name={t('chart_previous')} />
                    <Bar dataKey="Current" fill="#059669" radius={[4, 4, 0, 0]} name={t('chart_current')} />
                    <Bar dataKey="Minimum" fill="#f59e0b" radius={[4, 4, 0, 0]} name={t('chart_min')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div id="cabinet-qr-panel" className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm">{t('cabinet_list')}</h3>
              <p className="text-xs text-gray-500">{t('qr_tip')}</p>
              
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {db.cabinets.map(cabinet => {
                  const scanUrl = `${window.location.origin}?role=helper&cabinetId=${cabinet.id}`;
                  return (
                    <div key={cabinet.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-xs text-gray-800 truncate">{cabinet.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{cabinet.location}</p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => {
                            const svg = document.getElementById(`qr-${cabinet.id}`);
                            if (svg) {
                              const svgData = new XMLSerializer().serializeToString(svg);
                              const canvas = document.createElement("canvas");
                              const svgSize = 256;
                              canvas.width = svgSize;
                              canvas.height = svgSize;
                              const ctx = canvas.getContext("2d");
                              const img = new Image();
                              img.onload = () => {
                                if (ctx) {
                                  ctx.fillStyle = "#ffffff";
                                  ctx.fillRect(0, 0, svgSize, svgSize);
                                  ctx.drawImage(img, 0, 0, svgSize, svgSize);
                                  const pngUrl = canvas.toDataURL("image/png");
                                  const downloadLink = document.createElement("a");
                                  downloadLink.href = pngUrl;
                                  downloadLink.download = `${cabinet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`;
                                  document.body.appendChild(downloadLink);
                                  downloadLink.click();
                                  document.body.removeChild(downloadLink);
                                }
                              };
                              img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
                            }
                          }}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-all cursor-pointer"
                          title="Download QR Label"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <div className="bg-white p-1 rounded-md border border-gray-200 shadow-2xs">
                          <QRCodeSVG 
                            id={`qr-${cabinet.id}`}
                            value={scanUrl} 
                            size={44} 
                            level="H" 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activity Logs Row */}
          <div id="activity-logs-row" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                {t('recent_activity')} - {t('activity_inspection')}
              </h3>
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                {db.inspectionLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No inspections recorded yet.</p>
                ) : (
                  db.inspectionLogs.slice().reverse().map((log) => (
                    <div key={log.id} className="py-3 text-xs flex flex-col space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-700">{getCabName(log.cabinetId)}</span>
                        <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Inspector: <strong className="text-gray-700">{log.userName}</strong></span>
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 bg-gray-50 p-2 rounded-md mt-1 font-mono">
                        {log.itemsCounted.map(ic => {
                          const item = db.items.find(i => i.id === ic.itemId);
                          return (
                            <div key={ic.itemId} className="flex justify-between">
                              <span>• {item?.name || 'Unknown'}:</span>
                              <span>{ic.countedQuantity} {item?.unit} (was {ic.previousQuantity})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                {t('recent_activity')} - {t('activity_consumption')}
              </h3>
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                {db.consumptionLogs.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No consumable withdrawals logged yet.</p>
                ) : (
                  db.consumptionLogs.slice().reverse().map((log) => (
                    <div key={log.id} className="py-3 text-xs flex flex-col space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-rose-700 font-bold">-{log.quantityConsumed} {db.items.find(i => i.id === log.itemId)?.unit || ''}</span>
                        <span className="text-gray-700 font-medium">{log.itemName}</span>
                        <span className="text-gray-400 font-normal">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>User: <strong className="text-gray-700">{log.userName}</strong> ({log.departmentName})</span>
                        <span>Cabinet: {log.cabinetName}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 bg-rose-50/40 p-1.5 rounded-md mt-1 border border-rose-100/30">
                        <span className="font-semibold">Purpose:</span> {log.purpose}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ITEMS MANAGEMENT TAB */}
      {activeTab === 'items' && (
        <div id="items-tab-content" className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden animate-fade-in space-y-4 p-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{t('tab_items')}</h3>
              <p className="text-xs text-gray-500">Define active items, safe stock lines, and owning departments.</p>
            </div>
            <button
              id="btn-add-item"
              onClick={() => triggerAddModal('items')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('btn_add_item')}
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-semibold text-xs border-b border-gray-100 uppercase tracking-wider">
                  <th className="p-3">{t('col_name')}</th>
                  <th className="p-3">{t('col_cabinet')}</th>
                  <th className="p-3">{t('col_dept')}</th>
                  <th className="p-3 text-right">{t('col_stock')}</th>
                  <th className="p-3 text-right">{t('col_min')}</th>
                  <th className="p-3 text-center">{t('col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {db.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400">No items configured. Click "Add Consumable" to create.</td>
                  </tr>
                ) : (
                  db.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-3 flex items-center space-x-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-10 h-10 object-cover rounded-md border border-gray-100 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-mono">{item.id}</p>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{getCabName(item.cabinetId)}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-medium text-[10px]">
                          {getDeptName(item.departmentId)}
                        </span>
                      </td>
                      <td className="p-3 text-right font-medium">
                        <span className={`px-2 py-0.5 rounded-md ${item.currentStock <= item.minThreshold ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200' : 'text-gray-800'}`}>
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="p-3 text-right text-gray-500">{item.minThreshold} {item.unit}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center items-center space-x-1">
                          <button
                            onClick={() => triggerEditModal('items', item)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-emerald-600 rounded-md transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-rose-600 rounded-md transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CABINETS MANAGEMENT TAB */}
      {activeTab === 'cabinets' && (
        <div id="cabinets-tab-content" className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{t('tab_cabinets')}</h3>
              <p className="text-xs text-gray-500">Configure physical containment lockers, locations, and inspection states.</p>
            </div>
            <button
              onClick={() => triggerAddModal('cabinets')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('btn_add_cabinet')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {db.cabinets.map((cabinet) => {
              const cabinetItems = db.items.filter(item => item.cabinetId === cabinet.id);
              return (
                <div key={cabinet.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-gray-800 text-sm truncate">{cabinet.name}</h4>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => triggerEditModal('cabinets', cabinet)}
                          className="p-1 hover:bg-gray-200 text-gray-500 hover:text-emerald-600 rounded-md cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCabinet(cabinet.id)}
                          className="p-1 hover:bg-gray-200 text-gray-500 hover:text-rose-600 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">📍 {cabinet.location}</p>
                    <p className="text-[11px] text-gray-400 font-mono">ID: {cabinet.id}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200/50 flex justify-between items-center text-xs text-gray-500">
                    <span>Stored Consumables: <strong className="text-gray-700">{cabinetItems.length}</strong></span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100 font-medium flex items-center gap-1">
                      <QrCode className="w-3 h-3" /> Label Ready
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DEPARTMENTS TAB */}
      {activeTab === 'departments' && (
        <div id="departments-tab-content" className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{t('tab_departments')}</h3>
              <p className="text-xs text-gray-500">Add operational teams who own shared inventory allocations.</p>
            </div>
            <button
              onClick={() => triggerAddModal('departments')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('btn_add_dept')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {db.departments.map((dept) => {
              const deptItems = db.items.filter(item => item.departmentId === dept.id);
              const deptStaff = db.users.filter(u => u.departmentId === dept.id);
              return (
                <div key={dept.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-gray-800 text-sm truncate">{dept.name}</h4>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => triggerEditModal('departments', dept)}
                          className="p-1 hover:bg-gray-200 text-gray-500 hover:text-emerald-600 rounded-md cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDept(dept.id)}
                          className="p-1 hover:bg-gray-200 text-gray-500 hover:text-rose-600 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">ID: {dept.id}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200/50 flex flex-col gap-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Assigned Items:</span>
                      <strong className="text-gray-700">{deptItems.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Personnel:</span>
                      <strong className="text-gray-700">{deptStaff.length}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* USERS / PERSONNEL MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div id="users-tab-content" className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{t('tab_users')}</h3>
              <p className="text-xs text-gray-500">Manage user access authorizations and Google Authentication bindings.</p>
            </div>
            <button
              onClick={() => triggerAddModal('users')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('btn_add_user')}
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-semibold text-xs border-b border-gray-100 uppercase tracking-wider">
                  <th className="p-3">{t('col_user_name')}</th>
                  <th className="p-3">{t('col_email')}</th>
                  <th className="p-3">{t('col_role')}</th>
                  <th className="p-3">{t('col_dept')}</th>
                  <th className="p-3 text-center">{t('col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {db.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-mono">{user.id}</p>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600 font-mono">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                        user.role === 'admin'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : user.role === 'helper'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{user.departmentId ? getDeptName(user.departmentId) : 'Full Warehouse Scope'}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center items-center space-x-1">
                        <button
                          onClick={() => triggerEditModal('users', user)}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-emerald-600 rounded-md cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {user.email.toLowerCase() !== 'pousan888@gmail.com' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-rose-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDITING MODAL (COVERS ALL ENTITIES DYNAMICALLY) */}
      <AnimatePresence>
        {isModalOpen && (
          <div id="dynamic-modal-overlay" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h4 className="font-bold text-gray-800 text-base">
                  {editingItem ? 'Edit' : 'Add New'} {modalType === 'items' ? 'Consumable' : modalType === 'cabinets' ? 'Cabinet' : modalType === 'departments' ? 'Department' : 'User'}
                </h4>
                <button 
                  onClick={() => { setIsModalOpen(false); setEditingItem(null); }}
                  className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* MODAL FOR ITEMS */}
              {modalType === 'items' && (
                <form onSubmit={handleSaveItem} className="p-5 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Item Name</label>
                    <input required type="text" name="name" defaultValue={editingItem?.name || ''} placeholder="e.g. Nitrile Gloves (L)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Owning Department</label>
                      <select required name="departmentId" defaultValue={editingItem?.departmentId || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden">
                        <option value="" disabled>Select Department</option>
                        {db.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Cabinet Containment</label>
                      <select required name="cabinetId" defaultValue={editingItem?.cabinetId || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden">
                        <option value="" disabled>Select Cabinet</option>
                        {db.cabinets.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Qty Stock</label>
                      <input required type="number" min="0" name="currentStock" defaultValue={editingItem?.currentStock !== undefined ? editingItem.currentStock : 0} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Min Threshold</label>
                      <input required type="number" min="0" name="minThreshold" defaultValue={editingItem?.minThreshold !== undefined ? editingItem.minThreshold : 10} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Unit Label</label>
                      <input required type="text" name="unit" defaultValue={editingItem?.unit || 'pcs'} placeholder="pcs / boxes" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Image URL (Optional)</label>
                    <input type="url" name="imageUrl" defaultValue={editingItem?.imageUrl || ''} placeholder="https://unsplash.com/..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" />
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer">Save Consumable</button>
                  </div>
                </form>
              )}

              {/* MODAL FOR CABINETS */}
              {modalType === 'cabinets' && (
                <form onSubmit={handleSaveCabinet} className="p-5 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Cabinet Name/ID</label>
                    <input required type="text" name="name" defaultValue={editingItem?.name || ''} placeholder="e.g. CAB-004 (Lab Annex)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Physical Location</label>
                    <input required type="text" name="location" defaultValue={editingItem?.location || ''} placeholder="e.g. Zone D - Research Bay" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" />
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer">Save Cabinet</button>
                  </div>
                </form>
              )}

              {/* MODAL FOR DEPARTMENTS */}
              {modalType === 'departments' && (
                <form onSubmit={handleSaveDept} className="p-5 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Department Name</label>
                    <input required type="text" name="name" defaultValue={editingItem?.name || ''} placeholder="e.g. Safety Division" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" />
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer">Save Department</button>
                  </div>
                </form>
              )}

              {/* MODAL FOR USERS */}
              {modalType === 'users' && (
                <form onSubmit={handleSaveUser} className="p-5 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Personnel Name</label>
                    <input required type="text" name="name" defaultValue={editingItem?.name || ''} placeholder="e.g. Sarah Connor" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Gmail Address</label>
                    <input required type="email" name="email" defaultValue={editingItem?.email || ''} placeholder="e.g. sarah@gmail.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Authorized Role</label>
                      <select required name="role" defaultValue={editingItem?.role || 'helper'} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden">
                        <option value="admin">Admin (All Access)</option>
                        <option value="helper">Helper (Inspection)</option>
                        <option value="qc">QC (Consumption)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Dept Affiliation</label>
                      <select name="departmentId" defaultValue={editingItem?.departmentId || ''} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden">
                        <option value="">Global / Unassigned</option>
                        {db.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer">Save Member</button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
