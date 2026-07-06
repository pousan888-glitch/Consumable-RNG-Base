/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Minus, CheckCircle, AlertTriangle, RefreshCw, 
  Layers, Package, ChevronRight, History, ShieldAlert, LogOut 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryDB, ConsumableItem, Cabinet, User } from '../types.js';
import { apiFetch } from '../apiFallback.js';
import { translations } from '../localization.js';

interface QCConsumptionProps {
  db: InventoryDB;
  currentUser: User;
  onUpdateDB: (updatedFields: Partial<InventoryDB>) => Promise<void>;
  language?: 'th' | 'en';
}

export default function QCConsumption({ db, currentUser, onUpdateDB, language = 'th' }: QCConsumptionProps) {
  const [selectedCabinetId, setSelectedCabinetId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [qtyToConsume, setQtyToConsume] = useState<number>(1);
  const [purpose, setPurpose] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

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

  // Cabinets that contain items owned by departments (or any cabinet)
  const availableCabinets = db.cabinets;

  // Items stored in the selected cabinet
  const itemsInSelectedCabinet = db.items.filter(item => item.cabinetId === selectedCabinetId);

  // Selected item detail
  const selectedItem = db.items.find(item => item.id === selectedItemId);

  const getDeptName = (id: string) => db.departments.find(d => d.id === id)?.name || 'Unknown';
  const getCabName = (id: string) => db.cabinets.find(c => c.id === id)?.name || 'Unknown';

  const handleCabinetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCabinetId(e.target.value);
    setSelectedItemId('');
    setQtyToConsume(1);
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedItemId(e.target.value);
    setQtyToConsume(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || qtyToConsume <= 0 || !purpose) return;

    if (selectedItem && selectedItem.currentStock < qtyToConsume) {
      alert(`Requested withdrawal quantity exceeds current stock. Only ${selectedItem.currentStock} ${selectedItem.unit} remaining.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch('/api/logs/consumption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser.email
        },
        body: JSON.stringify({
          itemId: selectedItemId,
          quantityConsumed: qtyToConsume,
          purpose: purpose
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success animation
        setSuccessFeedback(`Successfully withdrew ${qtyToConsume} ${selectedItem?.unit} of ${selectedItem?.name}.`);
        
        // Update local state
        const updatedItems = db.items.map(item => item.id === selectedItemId ? result.item : item);
        await onUpdateDB({
          items: updatedItems,
          consumptionLogs: [...db.consumptionLogs, result.log]
        });

        // Reset form fields
        setSelectedItemId('');
        setQtyToConsume(1);
        setPurpose('');

        setTimeout(() => {
          setSuccessFeedback(null);
        }, 2000);
      } else {
        const err = await response.json();
        alert(`Failed to log withdrawal: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while processing material withdrawal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter consumption logs for the user's department, or show all for convenient testing
  const relevantLogs = db.consumptionLogs.slice().reverse().slice(0, 5);

  return (
    <div id="qc-consumption-root" className="max-w-md mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* HEADER BAR */}
      <div id="qc-header" className="bg-rose-400 p-5 rounded-2xl text-slate-950 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black text-slate-900 tracking-wider">Quality Control Division</p>
          <h2 className="text-xl font-black uppercase tracking-tight">{t('qc_panel_title')}</h2>
        </div>
        <Package className="w-8 h-8 text-slate-900 shrink-0" />
      </div>

      {/* QC WITHDRAWAL FORM */}
      <div id="qc-withdraw-card" className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
        <div className="flex items-center space-x-2 border-b-2 border-slate-200 pb-3">
          <Layers className="w-4 h-4 text-rose-500" />
          <h3 className="font-black uppercase text-slate-900 text-xs">{t('qc_panel_title')}</h3>
        </div>

        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          {t('qc_intro')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: SELECT CABINET */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
              <span className="w-4 h-4 bg-rose-400 text-[10px] text-slate-950 rounded-full flex items-center justify-center font-black border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">1</span>
              {t('tab_cabinets')}
            </label>
            <select
              required
              value={selectedCabinetId}
              onChange={handleCabinetChange}
              className="w-full px-3.5 py-2.5 border-2 border-slate-900 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            >
              <option value="" disabled>-- {t('tab_cabinets')} --</option>
              {availableCabinets.map(c => (
                <option key={c.id} value={c.id}>{c.name} [📍 {c.location}]</option>
              ))}
            </select>
          </div>

          {/* STEP 2: SELECT ITEM */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
              <span className="w-4 h-4 bg-rose-400 text-[10px] text-slate-950 rounded-full flex items-center justify-center font-black border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">2</span>
              {t('qc_select_item')}
            </label>
            <select
              required
              disabled={!selectedCabinetId}
              value={selectedItemId}
              onChange={handleItemChange}
              className="w-full px-3.5 py-2.5 border-2 border-slate-900 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-hidden disabled:bg-gray-50 disabled:text-gray-400 bg-white"
            >
              <option value="" disabled>-- {t('tab_items')} --</option>
              {itemsInSelectedCabinet.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({getDeptName(item.departmentId)} Allocation) - {item.currentStock} {item.unit} available
                </option>
              ))}
            </select>
          </div>

          {/* ITEM PREVIEW */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 rounded-xl p-3 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-between gap-4 overflow-hidden"
              >
                <div className="flex items-center space-x-2.5">
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.name} 
                    className="w-10 h-10 object-cover rounded-md border-2 border-slate-900" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-tight text-slate-900">{selectedItem.name}</h5>
                    <p className="text-[10px] font-bold text-slate-400">{t('col_assigned_dept')}: {getDeptName(selectedItem.departmentId)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{t('col_stock')}</p>
                  <p className="font-black text-slate-800 text-sm">{selectedItem.currentStock} {selectedItem.unit}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 3: QUANTITY TO WITHDRAW */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
              <span className="w-4 h-4 bg-rose-400 text-[10px] text-slate-950 rounded-full flex items-center justify-center font-black border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">3</span>
              {t('qc_pull_qty', { unit: selectedItem?.unit || '' })}
            </label>
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                disabled={!selectedItemId || qtyToConsume <= 1}
                onClick={() => setQtyToConsume(prev => Math.max(1, prev - 1))}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-gray-300 text-slate-900 border-2 border-slate-900 font-black rounded-lg flex items-center justify-center cursor-pointer text-sm shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px]"
              >
                -
              </button>
              <input
                required
                type="number"
                min="1"
                disabled={!selectedItemId}
                max={selectedItem?.currentStock || 1}
                value={qtyToConsume}
                onChange={(e) => setQtyToConsume(Math.max(1, Math.min(selectedItem?.currentStock || 1, parseInt(e.target.value, 10) || 1)))}
                className="w-full h-10 border-2 border-slate-900 rounded-lg text-center font-black text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden disabled:bg-gray-50 bg-slate-50"
              />
              <button
                type="button"
                disabled={!selectedItemId || (selectedItem && qtyToConsume >= selectedItem.currentStock)}
                onClick={() => setQtyToConsume(prev => prev + 1)}
                className="w-10 h-10 bg-rose-300 hover:bg-rose-400 disabled:bg-slate-50 disabled:text-gray-300 text-slate-900 border-2 border-slate-900 font-black rounded-lg flex items-center justify-center cursor-pointer text-sm shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px]"
              >
                +
              </button>
            </div>
          </div>

          {/* STEP 4: CONSUMPTION PURPOSE */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
              <span className="w-4 h-4 bg-rose-400 text-[10px] text-slate-950 rounded-full flex items-center justify-center font-black border border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">4</span>
              {t('qc_purpose')}
            </label>
            <textarea
              required
              disabled={!selectedItemId}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="..."
              rows={2}
              className="w-full px-3.5 py-2.5 border-2 border-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-hidden disabled:bg-gray-50 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedItemId || qtyToConsume <= 0}
            className="w-full py-3.5 bg-rose-400 hover:bg-rose-500 disabled:bg-rose-200 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> {t('login_authenticating')}
              </>
            ) : (
              <>
                <Minus className="w-4 h-4" /> {t('btn_submit_pull')}
              </>
            )}
          </button>
        </form>
      </div>

      {/* RECENT WITHDRAWALS LOG */}
      <div id="recent-pulls" className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
        <div className="flex items-center space-x-2 border-b-2 border-slate-200 pb-2.5">
          <History className="w-4 h-4 text-slate-800" />
          <h4 className="font-black uppercase text-slate-900 text-xs">{t('recent_activity')}</h4>
        </div>
        
        <div className="divide-y divide-gray-100">
          {relevantLogs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">{t('no_recent_activity')}</p>
          ) : (
            relevantLogs.map(log => (
              <div key={log.id} className="py-2.5 text-xs flex flex-col space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-black text-rose-500 text-sm shrink-0">-{log.quantityConsumed} {db.items.find(i => i.id === log.itemId)?.unit || 'pcs'}</span>
                  <span className="font-black uppercase tracking-tight text-slate-800 truncate px-2 text-left w-full">{log.itemName}</span>
                  <span className="font-bold text-[10px] text-slate-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px] font-bold">
                  <span>Authorized: <strong className="text-slate-600">{log.userName}</strong></span>
                  <span>{getCabName(log.cabinetId).split(' (')[0]}</span>
                </div>
                <p className="text-[11px] text-slate-700 bg-slate-100 border border-slate-200 p-2 rounded-md mt-1.5 font-medium">
                  <strong className="text-slate-900 font-bold">Usage:</strong> {log.purpose}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {successFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-rose-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-5"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-xs w-full text-center space-y-4"
            >
              <div className="w-16 h-16 bg-rose-300 text-slate-950 rounded-full flex items-center justify-center mx-auto border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <CheckCircle className="w-8 h-8 text-slate-950 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black uppercase tracking-tight text-slate-900 text-sm">{t('pull_success')}</h3>
                <p className="text-xs font-bold text-slate-400">{successFeedback}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
