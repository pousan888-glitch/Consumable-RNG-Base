/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Smartphone, Package, Check, RefreshCw, UserPlus, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { User, UserRole } from '../types.js';

interface RoleSwitcherProps {
  currentUser: User | null;
  onSelectUser: (email: string, name?: string, role?: UserRole) => Promise<void>;
  onResetDB: () => Promise<void>;
}

export default function RoleSwitcher({ currentUser, onSelectUser, onResetDB }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('helper');
  const [isResetting, setIsResetting] = useState(false);

  const testAccounts = [
    { email: 'pousan888@gmail.com', name: 'Pousan Admin', role: 'admin', icon: Shield, bg: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
    { email: 'helper1@gmail.com', name: 'John Helper', role: 'helper', icon: Smartphone, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
    { email: 'qc1@gmail.com', name: 'Sarah QC', role: 'qc', icon: Package, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' }
  ];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    onSelectUser(customEmail, customName || customEmail.split('@')[0], customRole);
    setCustomEmail('');
    setCustomName('');
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset the database to the initial standard demo state? This will wipe custom changes.')) {
      setIsResetting(true);
      await onResetDB();
      setIsResetting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] hover:bg-slate-800 transition-all border-2 border-slate-900 flex items-center gap-2 cursor-pointer font-black text-xs uppercase tracking-tight"
        >
          <Info className="w-4 h-4 animate-bounce text-yellow-400" />
          Open Sandbox Testing Panel
        </button>
      </div>
    );
  }

  return (
    <div id="simulation-panel" className="bg-slate-950 text-white p-5 rounded-b-2xl border-b-4 border-l-2 border-r-2 border-slate-900 space-y-4 z-40 relative shadow-[0px_8px_16px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping shrink-0" />
          <h2 className="font-black text-xs tracking-wider uppercase text-yellow-400 font-mono">Sandbox Simulation Workspace</h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            disabled={isResetting}
            onClick={handleReset}
            className="text-[10px] bg-slate-900 hover:bg-slate-800 text-amber-300 font-black uppercase tracking-tight px-3 py-1.5 rounded-lg border-2 border-slate-800 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            Reset DB to Default
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-xs text-slate-400 hover:text-white font-black uppercase tracking-tight cursor-pointer"
          >
            Hide Panel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
        {/* COL 1: PRESET ACCOUNTS */}
        <div className="space-y-2 lg:col-span-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Select Preset Role for Instant Login testing:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {testAccounts.map(acc => {
              const Icon = acc.icon;
              const isActive = currentUser?.email.toLowerCase() === acc.email.toLowerCase();
              return (
                <button
                  key={acc.email}
                  onClick={() => onSelectUser(acc.email, acc.name, acc.role as UserRole)}
                  className={`p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                    isActive 
                      ? 'border-yellow-400 bg-slate-900 text-yellow-400 font-black shadow-[2px_2px_0px_0px_rgba(250,204,21,1)]' 
                      : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0 leading-tight">
                      <p className="text-xs uppercase font-black truncate">{acc.name}</p>
                      <p className="text-[10px] font-mono opacity-60 truncate">{acc.email}</p>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 shrink-0 text-yellow-400 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* COL 2: CUSTOM ACCOUNT GENERATOR */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-850 pt-3 lg:pt-0 lg:pl-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mb-2 font-mono">
            <UserCheck className="w-3.5 h-3.5" /> Create Custom User:
          </p>
          <form onSubmit={handleCustomLogin} className="space-y-2">
            <div className="flex gap-2">
              <input
                required
                type="email"
                placeholder="Google Account (Email)"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="bg-slate-900 border-2 border-slate-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg w-full font-mono focus:outline-hidden focus:ring-1 focus:ring-yellow-400"
              />
              <select
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value as UserRole)}
                className="bg-slate-900 border-2 border-slate-800 text-white text-[10px] px-1.5 py-1.5 rounded-lg font-black uppercase focus:outline-hidden"
              >
                <option value="admin">Admin</option>
                <option value="helper">Helper</option>
                <option value="qc">QC</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Display Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="bg-slate-900 border-2 border-slate-800 text-white text-[10px] px-2.5 py-1.5 rounded-lg w-full font-bold focus:outline-hidden"
              />
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-[10px] px-3 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors uppercase tracking-tight"
              >
                <UserPlus className="w-3.5 h-3.5" /> Join
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const UserCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);
