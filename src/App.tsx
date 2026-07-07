/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Warehouse, LogOut, BookOpen, ShieldCheck, Shield, ArrowRight,
  Database, Smartphone, Package, ChevronRight, HelpCircle, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import firebaseAppletConfig from '../firebase-applet-config.json';
import { InventoryDB, User, UserRole } from './types.js';
import { apiFetch } from './apiFallback.js';
import { translations } from './localization.js';
import AdminDashboard from './components/AdminDashboard.js';
import HelperCount from './components/HelperCount.js';
import QCConsumption from './components/QCConsumption.js';
import RoleSwitcher from './components/RoleSwitcher.js';

// Initialize Firebase client directly using the configuration file
const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  projectId: firebaseAppletConfig.projectId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
  appId: firebaseAppletConfig.appId,
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export default function App() {
  const [db, setDb] = useState<InventoryDB | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDocsModal, setActiveDocsModal] = useState(false);
  const [preselectedCabinetId, setPreselectedCabinetId] = useState<string | undefined>(undefined);
  
  // Real Google sign-in states
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Language state
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  // Change language and sync to user's profile on server
  const changeLanguage = async (newLang: 'th' | 'en') => {
    setLanguage(newLang);
    localStorage.setItem('consumables_preferred_language', newLang);
    if (currentUser) {
      const updatedUser = { ...currentUser, language: newLang };
      setCurrentUser(updatedUser);
      try {
        await apiFetch('/api/users/language', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': currentUser.email
          },
          body: JSON.stringify({ language: newLang })
        });
        if (db) {
          const updatedUsers = db.users.map(u => u.id === currentUser.id ? { ...u, language: newLang } : u);
          setDb({ ...db, users: updatedUsers });
        }
      } catch (err) {
        console.error('Failed to update language on server:', err);
      }
    }
  };

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
              if (user.language) {
                setLanguage(user.language);
              } else {
                const storedLang = localStorage.getItem('consumables_preferred_language') as 'th' | 'en';
                if (storedLang) {
                  setLanguage(storedLang);
                }
              }
            }
          } else {
            const storedLang = localStorage.getItem('consumables_preferred_language') as 'th' | 'en';
            if (storedLang) {
              setLanguage(storedLang);
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
  const handleLogin = async (email: string, name?: string, role?: UserRole, isSimulation = false) => {
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

        if (!isSimulation) {
          if (user.role === 'admin' || user.email.toLowerCase() === 'pousan888@gmail.com') {
            localStorage.setItem('consumables_is_admin_tester', 'true');
          } else {
            localStorage.removeItem('consumables_is_admin_tester');
          }
        }
        
        // Handle language preference
        if (user.language) {
          setLanguage(user.language);
          localStorage.setItem('consumables_preferred_language', user.language);
        } else {
          const currentLang = localStorage.getItem('consumables_preferred_language') as 'th' | 'en' || 'th';
          setLanguage(currentLang);
          try {
            await apiFetch('/api/users/language', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-User-Email': user.email
              },
              body: JSON.stringify({ language: currentLang })
            });
          } catch (e) {
            console.error('Failed to save language choice during login:', e);
          }
        }
        
        // Refresh full DB to ensure custom users exist
        const stateRes = await apiFetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setDb(stateData);
        }
      }
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  // Google Firebase Sign-In implementation
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      const name = result.user.displayName || email?.split('@')[0] || 'Google User';
      if (email) {
        await handleLogin(email, name);
      } else {
        setAuthError('Could not retrieve email from Google Account.');
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setAuthError('Popup blocked by browser. Please enable popups or try opening the app in a new tab.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled. Please complete the flow in the popup window.');
      } else {
        setAuthError(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign out
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('consumables_user_email');
    localStorage.removeItem('consumables_is_admin_tester');
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
      
      {/* Sandbox testing switcher */}
      {currentUser && localStorage.getItem('consumables_is_admin_tester') === 'true' && (
        <RoleSwitcher currentUser={currentUser} onSelectUser={(email, name, role) => handleLogin(email, name, role, true)} onResetDB={handleResetDB} />
      )}

      {/* NAV HEADER */}
      <header id="app-header" className="bg-white border-2 border-slate-900 mx-4 md:mx-6 mt-6 px-6 py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center border-2 border-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] shrink-0">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase leading-none">{translations[language].nav_title}</h1>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">{translations[language].nav_subtitle}</p>
            </div>
          </div>

          {/* User controls / Language switcher / Documentation activator */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => changeLanguage(language === 'th' ? 'en' : 'th')}
              className="text-xs text-slate-900 bg-indigo-400 hover:bg-indigo-500 font-black px-3.5 py-2.5 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]"
            >
              <span>🌐 {language === 'th' ? 'English' : 'ภาษาไทย'}</span>
            </button>

            <button
              onClick={() => setActiveDocsModal(true)}
              className="text-xs text-slate-900 hover:text-slate-900 bg-amber-300 hover:bg-amber-400 font-black px-3.5 py-2.5 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]"
            >
              <BookOpen className="w-4 h-4" />
              {translations[language].btn_schemas}
            </button>

            {currentUser && (
              <div className="flex items-center gap-3 border-l-2 border-slate-200 pl-3">
                <div className="hidden sm:block text-right leading-tight">
                  <p className="font-black text-sm text-slate-900">{currentUser.name}</p>
                  <span className={`text-[9px] font-bold uppercase border border-slate-900 px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] ${
                    currentUser.role === 'admin' ? 'bg-amber-400' : currentUser.role === 'qc' ? 'bg-rose-400' : 'bg-indigo-400 text-white'
                  }`}>
                    {currentUser.role === 'admin' ? translations[language].user_role_admin : currentUser.role === 'qc' ? translations[language].user_role_qc : translations[language].user_role_helper}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-100 overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="Avatar" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-white hover:bg-red-500 hover:text-white text-slate-800 border-2 border-slate-900 rounded-lg transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]"
                  title={translations[language].sign_out}
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
              className="max-w-4xl mx-auto my-8 bg-white rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] overflow-hidden grid grid-cols-1 md:grid-cols-2"
            >
              {/* Left Column (Navy Geometric Balance Style) */}
              <div className="bg-[#0f172a] p-8 md:p-12 flex flex-col justify-between text-white border-b-2 md:border-b-0 md:border-r-2 border-slate-900">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 border-2 border-slate-900 rounded flex items-center justify-center font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xs font-mono">W</span>
                  </div>
                  <span className="font-mono text-xs font-black tracking-widest text-indigo-400 uppercase">{translations[language].login_system_name}</span>
                </div>

                <div className="my-12 md:my-16 space-y-6">
                  <h1 className="font-sans font-black italic text-3xl md:text-4xl text-white tracking-tight uppercase leading-tight whitespace-pre-line">
                    {translations[language].login_title_left}
                  </h1>
                  <div className="w-16 h-1.5 bg-indigo-500 rounded"></div>
                  <p className="text-xs font-sans text-slate-300 leading-relaxed">
                    {translations[language].login_desc_left}
                  </p>
                </div>

                <div className="mt-auto">
                  <p className="text-[10px] font-mono text-indigo-400 font-bold tracking-wider uppercase">
                    {translations[language].login_status_required}
                  </p>
                </div>
              </div>

              {/* Right Column (Light Login Panel) */}
              <div className="bg-white p-8 md:p-12 flex flex-col justify-between text-slate-900">
                <div className="space-y-6">
                  <div className="inline-block bg-black text-white px-3 py-1 font-mono text-[10px] font-black uppercase tracking-widest">
                    {translations[language].login_right_header}
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                    {translations[language].login_right_desc}
                  </p>
                </div>

                {/* Big Green Emerald Button */}
                <div className="my-8 space-y-4">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticating}
                    className="w-full p-4 flex items-center justify-between bg-[#00b074] hover:bg-[#009b65] disabled:bg-slate-100 disabled:opacity-80 text-white border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all cursor-pointer group active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-white border-2 border-slate-900 rounded flex items-center justify-center shrink-0">
                        {isAuthenticating ? (
                          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" strokeLinecap="round" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        )}
                      </div>
                      <span className="font-sans font-black text-xs text-slate-900 tracking-wider">
                        {isAuthenticating ? translations[language].login_authenticating : translations[language].login_button_google}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-900 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {authError && (
                    <div className="p-3.5 border-2 border-red-500 bg-red-50 text-red-600 font-bold text-[10px] rounded-xl uppercase tracking-wider flex items-start space-x-2 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-[9px] font-mono font-black text-slate-400 tracking-wider uppercase leading-normal">
                      {translations[language].login_trouble.split('OPENING IN NEW TAB')[0]}
                      <span className="text-blue-600 underline cursor-pointer hover:text-blue-800" onClick={() => window.open(window.location.href, '_blank')}>
                        {language === 'th' ? 'เปิดในแท็บใหม่' : 'OPENING IN NEW TAB'}
                      </span>
                      {translations[language].login_trouble.split('OPENING IN NEW TAB')[1] || ''}
                    </p>
                  </div>
                </div>

                {/* Handshake Status box at the bottom */}
                <div className="mt-auto border-2 border-slate-900 bg-slate-50 p-3.5 rounded-xl flex items-center space-x-3.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
                  <Shield className="w-5 h-5 text-slate-800 shrink-0" />
                  <div className="font-mono text-[9px] font-bold text-slate-500 uppercase leading-relaxed tracking-tight">
                    {translations[language].login_secure_gateway} <br />
                    <span className="text-emerald-600 font-black">{translations[language].login_ready}</span>
                  </div>
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
                  language={language}
                />
              )}
              {currentUser.role === 'helper' && (
                <HelperCount 
                  db={db} 
                  currentUser={currentUser} 
                  onUpdateDB={handleUpdateDB} 
                  preselectedCabinetId={preselectedCabinetId}
                  language={language}
                />
              )}
              {currentUser.role === 'qc' && (
                <QCConsumption 
                  db={db} 
                  currentUser={currentUser} 
                  onUpdateDB={handleUpdateDB} 
                  language={language}
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
