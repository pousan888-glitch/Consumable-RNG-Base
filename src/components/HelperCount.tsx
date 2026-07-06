/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Camera, CheckCircle, ChevronRight, AlertTriangle, 
  RotateCcw, Save, Search, RefreshCw, Smartphone, QrCode 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryDB, ConsumableItem, Cabinet, User } from '../types.js';

interface HelperCountProps {
  db: InventoryDB;
  currentUser: User;
  onUpdateDB: (updatedFields: Partial<InventoryDB>) => Promise<void>;
  preselectedCabinetId?: string;
}

export default function HelperCount({ db, currentUser, onUpdateDB, preselectedCabinetId }: HelperCountProps) {
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);
  const [cabinetItems, setCabinetItems] = useState<ConsumableItem[]>([]);
  const [counts, setCounts] = useState<{ [itemId: string]: number }>({});
  const [isScanning, setIsScanning] = useState(false);
  const [scannerFeedback, setScannerFeedback] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If a cabinet was preselected (e.g., via QR Code link on Admin dashboard or URL param), auto-load it
  useEffect(() => {
    if (preselectedCabinetId) {
      const cab = db.cabinets.find(c => c.id === preselectedCabinetId);
      if (cab) {
        handleSelectCabinet(cab);
      }
    }
  }, [preselectedCabinetId, db.cabinets]);

  const handleSelectCabinet = (cabinet: Cabinet) => {
    setSelectedCabinet(cabinet);
    const items = db.items.filter(item => item.cabinetId === cabinet.id);
    setCabinetItems(items);
    
    // Prefill counts with current stock levels
    const initialCounts: { [itemId: string]: number } = {};
    items.forEach(item => {
      initialCounts[item.id] = item.currentStock;
    });
    setCounts(initialCounts);
    setIsScanning(false);
    setSaveSuccess(false);
  };

  const handleIncrement = (itemId: string) => {
    setCounts(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleDecrement = (itemId: string) => {
    setCounts(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
    }));
  };

  const handleCountChange = (itemId: string, value: string) => {
    const val = parseInt(value, 10);
    setCounts(prev => ({
      ...prev,
      [itemId]: isNaN(val) ? 0 : Math.max(0, val)
    }));
  };

  const handleSaveCounts = async () => {
    if (!selectedCabinet) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/logs/inspection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': currentUser.email
        },
        body: JSON.stringify({
          cabinetId: selectedCabinet.id,
          counts: counts
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Success feedback
        setSaveSuccess(true);
        
        // Update global state
        await onUpdateDB({ 
          items: result.items,
          inspectionLogs: [...db.inspectionLogs, result.log]
        });

        // Clear after showing success
        setTimeout(() => {
          setSelectedCabinet(null);
          setCabinetItems([]);
          setCounts({});
          setSaveSuccess(false);
        }, 2000);
      } else {
        const err = await response.json();
        alert(`Failed to sync counts: ${err.error || 'Server error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Network error while saving inspection counts.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate scanning QR Code
  const startScanningSim = () => {
    setIsScanning(true);
    setScannerFeedback('Initializing camera sensor...');
    
    setTimeout(() => {
      setScannerFeedback('Focusing lens on Cabinet Label...');
    }, 1000);

    setTimeout(() => {
      setScannerFeedback('QR code detected! Aligning grid...');
    }, 2000);
  };

  const completeScanningSim = (cabinet: Cabinet) => {
    setScannerFeedback('Decoding Payload...');
    setTimeout(() => {
      handleSelectCabinet(cabinet);
    }, 600);
  };

  const getDeptName = (id: string) => db.departments.find(d => d.id === id)?.name || 'Unknown';

  return (
    <div id="helper-count-root" className="max-w-md mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* HEADER BAR */}
      <div id="helper-header" className="bg-emerald-400 p-5 rounded-2xl text-slate-950 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black text-slate-900 tracking-wider">Field Inspection Mode</p>
          <h2 className="text-xl font-black uppercase tracking-tight">Consumable Count</h2>
        </div>
        <Smartphone className="w-8 h-8 text-slate-900 shrink-0" />
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: SELECT CABINET OR START SCAN */}
        {!selectedCabinet && !isScanning && (
          <motion.div
            key="select-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Camera QR Scanner Activator */}
            <div id="qr-scan-card" className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <QrCode className="w-8 h-8 text-slate-900" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-sm uppercase">Scan Cabinet QR Code</h3>
                <p className="text-xs font-medium text-slate-400">Position the cabinet QR label inside your phone camera grid to load the custom items catalog instantly.</p>
              </div>
              <button
                id="btn-trigger-scan"
                onClick={startScanningSim}
                className="w-full py-3 px-4 bg-emerald-400 text-slate-950 hover:bg-emerald-500 font-black rounded-xl text-xs flex items-center justify-center gap-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)] h-12"
              >
                <Camera className="w-4 h-4" /> Start QR Scanner
              </button>
            </div>

            {/* Manual Selector Fallback */}
            {currentUser.role !== 'helper' && (
              <div id="manual-select-card" className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-slate-800" />
                  <h4 className="font-black uppercase text-slate-900 text-xs tracking-wider">Or Select Locker Manually</h4>
                </div>
                <div className="space-y-2">
                  {db.cabinets.map(cab => (
                    <button
                      key={cab.id}
                      onClick={() => handleSelectCabinet(cab)}
                      className="w-full text-left p-3 flex justify-between items-center bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)] text-xs cursor-pointer group"
                    >
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-emerald-800 uppercase tracking-tight">{cab.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">📍 {cab.location}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-800 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 2: ACTIVE SCANNING SCREEN */}
        {isScanning && (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] aspect-square flex flex-col justify-between p-5 text-white relative border-2 border-slate-900"
          >
            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-0 h-0.5 bg-emerald-500 opacity-75 shadow-lg shadow-emerald-500/50 animate-bounce top-1/2" />

            <div className="flex justify-between items-center z-10">
              <span className="text-xs bg-black/60 px-3 py-1 rounded-full border border-gray-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> Camera Active
              </span>
              <button 
                onClick={() => setIsScanning(false)}
                className="text-xs text-gray-400 hover:text-white bg-black/40 p-1.5 rounded-full"
              >
                Cancel
              </button>
            </div>

            {/* Target Reticle */}
            <div className="w-48 h-48 border-2 border-emerald-400/60 rounded-3xl mx-auto flex items-center justify-center border-dashed relative z-10 animate-pulse">
              <QrCode className="w-16 h-16 text-emerald-400/40" />
            </div>

            {/* Simulated Decode Options */}
            <div className="space-y-3 z-10 bg-black/80 p-3 rounded-xl border border-gray-800 text-center">
              <p className="text-[11px] text-emerald-300 font-mono tracking-wide">{scannerFeedback}</p>
              
              <div className="pt-2 border-t border-gray-800">
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1.5">Simulate scanning of:</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {db.cabinets.map(cab => (
                    <button
                      key={cab.id}
                      onClick={() => completeScanningSim(cab)}
                      className="w-full bg-emerald-600/20 hover:bg-emerald-600 text-emerald-100 hover:text-white py-1.5 px-3 rounded-lg text-[10px] font-semibold transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      {cab.name.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: ITEMS CHECKLIST AND INPUTS */}
        {selectedCabinet && !isScanning && (
          <motion.div
            key="item-count-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Loaded Cabinet Card */}
            <div className="bg-amber-300 p-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-black text-slate-900 tracking-wider">Locked Container Loaded</p>
                <h3 className="font-black text-slate-900 text-sm uppercase mt-0.5">{selectedCabinet.name}</h3>
                <p className="text-xs font-bold text-slate-800">📍 {selectedCabinet.location}</p>
              </div>
              <button
                onClick={() => setSelectedCabinet(null)}
                className="p-2 bg-white hover:bg-slate-50 text-slate-800 rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)] transition-colors cursor-pointer"
                title="Change Cabinet"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              {cabinetItems.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center text-gray-400 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs">No consumables are assigned to this cabinet.</p>
                </div>
              ) : (
                cabinetItems.map(item => {
                  const val = counts[item.id] || 0;
                  const isLow = val <= item.minThreshold;

                  return (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-between gap-4">
                      {/* Left: Thumbnail & Name */}
                      <div className="flex items-center space-x-3 min-w-0">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded-lg border-2 border-slate-900 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-xs uppercase tracking-tight truncate">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 truncate">{getDeptName(item.departmentId)} Allocation</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-slate-400 font-bold">Safe: {item.minThreshold} {item.unit}</span>
                            {isLow && (
                              <span className="text-[8px] bg-rose-400 text-slate-950 font-black border border-slate-900 px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] shrink-0 uppercase">
                                Low
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Incrementor Widget */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item.id)}
                          className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-900 border-2 border-slate-900 font-black rounded-lg flex items-center justify-center text-sm shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer select-none transition-all"
                          style={{ minWidth: '36px', minHeight: '36px' }}
                        >
                          -
                        </button>

                        <input
                          type="number"
                          value={val}
                          onChange={(e) => handleCountChange(item.id, e.target.value)}
                          className="w-12 h-10 border-2 border-slate-900 rounded-lg text-center font-black text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-slate-50"
                        />

                        <button
                          type="button"
                          onClick={() => handleIncrement(item.id)}
                          className="w-10 h-10 bg-emerald-300 hover:bg-emerald-400 text-slate-950 border-2 border-slate-900 font-black rounded-lg flex items-center justify-center text-sm shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer select-none transition-all"
                          style={{ minWidth: '36px', minHeight: '36px' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Action Bar */}
            {cabinetItems.length > 0 && (
              <div className="pt-2">
                <button
                  id="btn-save-counts"
                  disabled={isSubmitting}
                  onClick={handleSaveCounts}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Synchronizing Counts...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save & Sync to Admin Dashboard
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-5"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-xs w-full text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-400 text-slate-950 rounded-full flex items-center justify-center mx-auto border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <CheckCircle className="w-8 h-8 text-slate-950 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900 text-sm uppercase">Counts Synchronized!</h3>
                <p className="text-xs font-medium text-slate-400">Inventory stocks have been updated instantly in the main Admin dashboard.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
