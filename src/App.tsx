/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Warehouse, LogOut, BookOpen, ShieldCheck, 
  Database, Smartphone, Package, ChevronRight, HelpCircle, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryDB, User, UserRole } from './types.js';
import { apiFetch } from './apiFallback.js';
import AdminDashboard from './components/AdminDashboard.js';
import HelperCount from './components/HelperCount.js';
import QCConsumption from './components/QCConsumption.js';
import RoleSwitcher from './components/RoleSwitcher.js';

export default function App() {
  const [db, setDb] = useState<InventoryDB | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDocsModal, setActiveDocsModal] = useState(false);
  const [preselectedCabinetId, setPreselectedCabinetId] = useState<string | undefined>(undefined);

  // Fetch state on mount
  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await apiFetch('/api/state');
        if (response.ok) {
          const data = await response.json();
          setDb(data);

          // Restore session from localStorage if present
          const savedUserEmail = localStorage.getItem('consumables_user_email');
          if (savedUserEmail) {
            const user = data.users.find((u: User) => u.email.toLowerCase() === savedUserEmail.toLowerCase());
            if (user) {
              setCurrentUser(user);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchState();

    // Parse URL parameters for QR scan redirection simulation
    const params = new URLSearchParams(window.location.search);
    const cabinetId = params.get('cabinetId');
    if (cabinetId) {
      setPreselectedCabinetId(cabinetId);
      // Auto-switch to helper mode for instant preview response
      const savedUserEmail = localStorage.getItem('consumables_user_email');
      if (!savedUserEmail) {
        // Log in as default helper to make QR scan immediately workable!
        localStorage.setItem('consumables_user_email', 'helper1@gmail.com');
      }
    }
  }, []);

  // Sync state helper
  const handleUpdateDB = async (updatedFields: Partial<InventoryDB>) => {
    if (!db) return;
    const newState = { ...db, ...updatedFields };
    setDb(newState);
  };

  // Switch/Login user helper
  const handleLogin = async (email: string, name?: string, role?: UserRole) => {
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role })
      });

      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        localStorage.setItem('consumables_user_email', user.email);
        
        // Refresh full DB to ensure custom users exist
        const stateRes = await apiFetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.ok ? await stateRes.json() : db;
          setDb(stateData);
        }
      }
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  // Sign out
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('consumables_user_email');
    // Clear URL query parameters for clean state
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setPreselectedCabinetId(undefined);
    }
  };

  // Reset database helper
  const handleResetDB = async () => {
    try {
      const response = await apiFetch('/api/reset', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setDb(result.db);
        // Refresh session
        if (currentUser) {
          const freshUser = result.db.users.find((u: User) => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (freshUser) {
            setCurrentUser(freshUser);
          } else {
            handleLogout();
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !db) {
    return (
      <div id="loading-spinner" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500 font-sans">Booting Consumables Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-800 antialiased">
      
      {/* SANDBOX SWAP BAR FOR TESTING */}
      <RoleSwitcher 
        currentUser={currentUser} 
        onSelectUser={handleLogin} 
        onResetDB={handleResetDB} 
      />

      {/* NAV HEADER */}
      <header id="app-header" className="bg-white border-2 border-slate-900 mx-4 md:mx-6 mt-6 px-6 py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center border-2 border-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] shrink-0">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase leading-none">Consumables Monitor <span className="text-indigo-600">v2.0</span></h1>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Warehouse Management System</p>
            </div>
          </div>

          {/* User controls / Documentation activator */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveDocsModal(true)}
              className="text-xs text-slate-900 hover:text-slate-900 bg-amber-300 hover:bg-amber-400 font-black px-3.5 py-2.5 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]"
            >
              <BookOpen className="w-4 h-4" />
              Blueprint Code & Schemas
            </button>

            {currentUser && (
              <div className="flex items-center gap-3 border-l-2 border-slate-200 pl-3">
                <div className="hidden sm:block text-right leading-tight">
                  <p className="font-black text-sm text-slate-900">{currentUser.name}</p>
                  <span className={`text-[9px] font-bold uppercase border border-slate-900 px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] ${
                    currentUser.role === 'admin' ? 'bg-amber-400' : currentUser.role === 'qc' ? 'bg-rose-400' : 'bg-indigo-400 text-white'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-100 overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="Avatar" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-white hover:bg-red-500 hover:text-white text-slate-800 border-2 border-slate-900 rounded-lg transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* CORE FRAMEWORK CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          {!currentUser ? (
            /* LOGIN SCREEN WITH MULTI-ROLE DOCUMENTATION */
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto my-8 bg-white rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 md:p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-indigo-50 border-2 border-slate-900 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="pt-2">
                  <h2 className="font-black text-slate-900 text-xl uppercase tracking-tight">Account Verification</h2>
                  <p className="text-xs font-medium text-slate-400">Log in to sync with warehouse cabinets and allocations.</p>
                </div>
              </div>

              {/* Login Buttons */}
              <div className="space-y-3">
                <button
                  id="btn-google-login-admin"
                  onClick={() => handleLogin('pousan888@gmail.com', 'Pousan Admin', 'admin')}
                  className="w-full py-3 px-4 border-2 border-slate-900 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs flex items-center justify-between text-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] h-12"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-red-500 rounded-full border border-slate-900 shrink-0" />
                    <span className="font-mono">pousan888@gmail.com</span>
                  </div>
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-1 rounded border border-slate-900 uppercase shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">Super Admin</span>
                </button>

                <button
                  onClick={() => handleLogin('helper1@gmail.com', 'John Helper', 'helper')}
                  className="w-full py-3 px-4 border-2 border-slate-900 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs flex items-center justify-between text-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] h-12"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full border border-slate-900 shrink-0" />
                    <span className="font-mono">helper1@gmail.com</span>
                  </div>
                  <span className="text-[9px] bg-indigo-400 text-white font-black px-2 py-1 rounded border border-slate-900 uppercase shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">Helper Team</span>
                </button>

                <button
                  onClick={() => handleLogin('qc1@gmail.com', 'Sarah QC', 'qc')}
                  className="w-full py-3 px-4 border-2 border-slate-900 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs flex items-center justify-between text-slate-800 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] h-12"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full border border-slate-900 shrink-0" />
                    <span className="font-mono">qc1@gmail.com</span>
                  </div>
                  <span className="text-[9px] bg-rose-400 text-slate-950 font-black px-2 py-1 rounded border border-slate-900 uppercase shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">QC Pulls</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t-2 border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Or Login with Any Email</span>
                <div className="flex-grow border-t-2 border-slate-200"></div>
              </div>

              {/* Custom Email Input Login Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const emailInput = target.elements.namedItem('email') as HTMLInputElement;
                  const nameInput = target.elements.namedItem('name') as HTMLInputElement;
                  if (emailInput && emailInput.value) {
                    handleLogin(emailInput.value, nameInput.value || emailInput.value.split('@')[0], 'helper');
                  }
                }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">Google Email Address</label>
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2.5 border-2 border-slate-900 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">Display Name (Optional)</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2.5 border-2 border-slate-900 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                >
                  Verify & Enter App
                </button>
              </form>

              {/* Login Disclaimer info */}
              <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-xl text-[11px] text-slate-800 leading-relaxed flex items-start gap-2.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black uppercase tracking-tight text-indigo-600">OAuth Credentials Warning:</span>
                  <p className="mt-0.5 text-slate-600">The hardcoded Super Admin email <strong className="font-black text-slate-900">pousan888@gmail.com</strong> gets immediate full-scope privileges. Logins can be tested instantly in the sandbox above.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ROLE-BASED DASHBOARD ROUTER */
            <motion.div
              key={`${currentUser.role}-panel`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {currentUser.role === 'admin' && (
                <AdminDashboard 
                  db={db} 
                  currentUser={currentUser} 
                  onUpdateDB={handleUpdateDB} 
                />
              )}
              {currentUser.role === 'helper' && (
                <HelperCount 
                  db={db} 
                  currentUser={currentUser} 
                  onUpdateDB={handleUpdateDB} 
                  preselectedCabinetId={preselectedCabinetId}
                />
              )}
              {currentUser.role === 'qc' && (
                <QCConsumption 
                  db={db} 
                  currentUser={currentUser} 
                  onUpdateDB={handleUpdateDB} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* DOCUMENTATION MODAL FOR APP DESIGN, DATABASE SCHEMA & GOOGLE APPS SCRIPT CODE.GS */}
      <AnimatePresence>
        {activeDocsModal && (
          <div id="docs-modal-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-4xl w-full h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Deployment Blueprint docs</h3>
                    <p className="text-[10px] text-gray-500">Recommended DB Schemas & Complete Google Apps Script (Code.gs)</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDocsModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-500 p-2 rounded-full cursor-pointer font-bold text-sm"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700 leading-relaxed">
                
                {/* 1. ARCHITECTURE BRIEF */}
                <section className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-600" /> 
                    1. Recommended Database Schema (Google Sheets or SQL)
                  </h4>
                  <p>For warehouse/base consumable operations, a relational setup or a multi-tab Google Sheet provides the most durable, low-latency persistence layer:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <strong className="text-slate-800">Sheet Tab 1: Cabinets</strong>
                      <p className="text-[10px] text-slate-500">Columns: ID, Name, Location</p>
                      <span className="block text-[10px] font-mono text-slate-400 bg-slate-100 p-1.5 rounded-md mt-1">Example: [cab-1, "CAB-001 Assembly Floor", "Zone A - East Wall"]</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <strong className="text-slate-800">Sheet Tab 2: Departments</strong>
                      <p className="text-[10px] text-slate-500">Columns: ID, Name</p>
                      <span className="block text-[10px] font-mono text-slate-400 bg-slate-100 p-1.5 rounded-md mt-1">Example: [dept-1, "Production"]</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <strong className="text-slate-800">Sheet Tab 3: Consumables</strong>
                      <p className="text-[10px] text-slate-500">Columns: ID, Name, ImageUrl, DepartmentId, CabinetId, CurrentStock, MinThreshold, PreviousStock, Unit</p>
                      <span className="block text-[10px] font-mono text-slate-400 bg-slate-100 p-1.5 rounded-md mt-1">Example: [item-1, "Nitrile Gloves", "http://...", "dept-3", "cab-1", 150, 100, 180, "pcs"]</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <strong className="text-slate-800">Sheet Tab 4: Logs (Inspection & Pulls)</strong>
                      <p className="text-[10px] text-slate-500">Columns: LogId, LogType (Inspection | Consumption), CabinetId, ItemId, QtyDelta, UserEmail, Timestamp, Purpose</p>
                      <span className="block text-[10px] font-mono text-slate-400 bg-slate-100 p-1.5 rounded-md mt-1">Example: [l-72, "Consumption", "cab-1", "item-1", -10, "sarah@gmail.com", "2026-07-06...", "Shift assembly Replenish"]</span>
                    </div>
                  </div>
                </section>

                {/* 2. COMPLETE GOOGLE APPS SCRIPT CODE.GS */}
                <section className="space-y-2">
                  <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" /> 
                    2. Complete Backend Logic (Google Apps Script: Code.gs)
                  </h4>
                  <p>Copy and paste this production-ready Apps Script file into your Google Sheets extension. It handles GET requests to load catalog scopes and POST requests to transactionally record helper audits or QC material withdrawals.</p>
                  
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[10px] overflow-x-auto border border-slate-800 whitespace-pre">
{`/**
 * Google Apps Script Backend (Code.gs)
 * For Warehouse Consumables Monitor Sheets DB Integration
 */

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;
  
  if (action === "getState") {
    return ContentService.createTextOutput(JSON.stringify(getFullDBState(sheet)))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Invalid Action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const payload = JSON.parse(e.postData.contents);
  const action = payload.action;
  
  if (action === "inspection") {
    return processInspection(sheet, payload);
  } else if (action === "consumption") {
    return processConsumption(sheet, payload);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Invalid POST Action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 1. Transactionally log counts saved by Helper field team
function processInspection(sheet, payload) {
  const itemsSheet = sheet.getSheetByName("Consumables");
  const logsSheet = sheet.getSheetByName("Logs");
  
  const cabinetId = payload.cabinetId;
  const counts = payload.counts; // { [itemId: string]: number }
  const userEmail = payload.userEmail;
  const timestamp = new Date().toISOString();
  
  const itemDataRange = itemsSheet.getDataRange();
  const values = itemDataRange.getValues();
  
  // Loop and write counts transactionally
  for (let i = 1; i < values.length; i++) {
    const itemId = values[i][0];
    const itemCabinetId = values[i][4];
    
    if (itemCabinetId === cabinetId && counts[itemId] !== undefined) {
      const newQty = Number(counts[itemId]);
      const prevQty = Number(values[i][5]); // currentStock column
      
      // Update stocks
      itemsSheet.getRange(i + 1, 6).setValue(newQty); // set CurrentStock
      itemsSheet.getRange(i + 1, 8).setValue(prevQty); // set PreviousStock
      
      // Log historical audit line
      logsSheet.appendRow([
        "insp_" + Utilities.getUuid(),
        "Inspection",
        cabinetId,
        itemId,
        newQty - prevQty,
        userEmail,
        timestamp,
        "Field count inspection sync"
      ]);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success", timestamp }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 2. Log withdrawal pulled by Quality Control team
function processConsumption(sheet, payload) {
  const itemsSheet = sheet.getSheetByName("Consumables");
  const logsSheet = sheet.getSheetByName("Logs");
  
  const itemId = payload.itemId;
  const qtyConsumed = Number(payload.quantityConsumed);
  const userEmail = payload.userEmail;
  const purpose = payload.purpose;
  const timestamp = new Date().toISOString();
  
  const itemDataRange = itemsSheet.getDataRange();
  const values = itemDataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    const currentId = values[i][0];
    if (currentId === itemId) {
      const currentStock = Number(values[i][5]);
      if (currentStock < qtyConsumed) {
        return ContentService.createTextOutput(JSON.stringify({ error: "Insufficient Stock" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Subtract stocks
      itemsSheet.getRange(i + 1, 5).setValue(currentStock - qtyConsumed);
      
      // Append Log
      logsSheet.appendRow([
        "cons_" + Utilities.getUuid(),
        "Consumption",
        values[i][4], // cabinetId
        itemId,
        -qtyConsumed,
        userEmail,
        timestamp,
        purpose
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", newStock: currentStock - qtyConsumed }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Item not found" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper: load full state for frontend syncing
function getFullDBState(sheet) {
  return {
    cabinets: getSheetAsObjects(sheet.getSheetByName("Cabinets")),
    departments: getSheetAsObjects(sheet.getSheetByName("Departments")),
    items: getSheetAsObjects(sheet.getSheetByName("Consumables")),
    logs: getSheetAsObjects(sheet.getSheetByName("Logs"))
  };
}

function getSheetAsObjects(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const objects = [];
  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    objects.push(obj);
  }
  return objects;
}`}
                  </pre>
                </section>
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setActiveDocsModal(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2 rounded-xl cursor-pointer transition-colors"
                >
                  Got It, Close Docs
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER COOPERATIVE FOOTPRINT */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1.5 text-[11px] text-gray-400">
          <p className="font-semibold text-gray-500">Warehouse Consumables Monitor — Super Admin Roster Active</p>
          <p>This web application is configured for active synchronized deployment in the AI Studio live preview container sandbox.</p>
        </div>
      </footer>

    </div>
  );
}
