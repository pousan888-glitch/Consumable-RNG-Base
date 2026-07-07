/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { InventoryDB, User, Cabinet, Department, ConsumableItem, InspectionLog, ConsumptionLog } from './src/types.js';
import admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json());

// Initial database state
const initialDB: InventoryDB = {
  users: [
    { id: '1', email: 'pousan888@gmail.com', name: 'Pousan Admin', role: 'admin' },
    { id: '2', email: 'helper1@gmail.com', name: 'John Helper', role: 'helper', departmentId: 'dept-1' },
    { id: '3', email: 'qc1@gmail.com', name: 'Sarah QC', role: 'qc', departmentId: 'dept-2' }
  ],
  departments: [
    { id: 'dept-1', name: 'Production' },
    { id: 'dept-2', name: 'Maintenance' },
    { id: 'dept-3', name: 'Safety' },
    { id: 'dept-4', name: 'Laboratory' }
  ],
  cabinets: [
    { id: 'cab-1', name: 'CAB-001 (Main Assembly Floor)', location: 'Zone A - East Wall' },
    { id: 'cab-2', name: 'CAB-002 (Chemical Storage Bay)', location: 'Zone B - Hazmat Shed' },
    { id: 'cab-3', name: 'CAB-003 (R&D Lab Annex)', location: 'Lab Building - Room 102' }
  ],
  items: [
    { id: 'item-1', name: 'Nitrile Gloves (M)', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-3', cabinetId: 'cab-1', currentStock: 150, minThreshold: 100, previousStock: 180, unit: 'pcs' },
    { id: 'item-2', name: 'Safety Goggles', imageUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-3', cabinetId: 'cab-1', currentStock: 15, minThreshold: 20, previousStock: 22, unit: 'pcs' },
    { id: 'item-3', name: 'ESD Grounding Wrist Strap', imageUrl: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-1', cabinetId: 'cab-1', currentStock: 8, minThreshold: 10, previousStock: 12, unit: 'pcs' },
    { id: 'item-4', name: 'IPA Wipes (99%)', imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-4', cabinetId: 'cab-3', currentStock: 45, minThreshold: 30, previousStock: 50, unit: 'boxes' },
    { id: 'item-5', name: 'Multi-Purpose Lubricant', imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-2', cabinetId: 'cab-2', currentStock: 12, minThreshold: 10, previousStock: 15, unit: 'bottles' },
    { id: 'item-6', name: 'Chemical Sorbent Pads', imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-3', cabinetId: 'cab-2', currentStock: 5, minThreshold: 15, previousStock: 18, unit: 'packs' },
    { id: 'item-7', name: 'Solder Wire (60/40)', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=60', departmentId: 'dept-1', cabinetId: 'cab-3', currentStock: 25, minThreshold: 15, previousStock: 24, unit: 'rolls' }
  ],
  inspectionLogs: [
    {
      id: 'log-1',
      cabinetId: 'cab-1',
      userId: '2',
      userName: 'John Helper',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      itemsCounted: [
        { itemId: 'item-1', countedQuantity: 150, previousQuantity: 180 },
        { itemId: 'item-2', countedQuantity: 15, previousQuantity: 22 },
        { itemId: 'item-3', countedQuantity: 8, previousQuantity: 12 }
      ]
    }
  ],
  consumptionLogs: [
    {
      id: 'cons-1',
      itemId: 'item-1',
      itemName: 'Nitrile Gloves (M)',
      cabinetId: 'cab-1',
      cabinetName: 'CAB-001 (Main Assembly Floor)',
      userId: '3',
      userName: 'Sarah QC',
      departmentId: 'dept-3',
      departmentName: 'Safety',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      quantityConsumed: 10,
      purpose: 'Regular assembly shift replenishment'
    }
  ]
};

// Initialize Firebase Admin with flexible environment variable support for production deployments
let firebaseDb: Firestore | null = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  let projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  let databaseId = process.env.FIREBASE_DATABASE_ID;

  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    projectId = projectId || firebaseConfig.projectId;
    databaseId = databaseId || firebaseConfig.firestoreDatabaseId;
  }

  if (projectId) {
    admin.initializeApp({
      projectId: projectId,
    });
    if (databaseId) {
      try {
        firebaseDb = getFirestore(databaseId);
      } catch (err) {
        console.warn('Failed to initialize Firestore with named database ID, falling back to default:', err);
        firebaseDb = getFirestore();
      }
    } else {
      firebaseDb = getFirestore();
    }
    console.log('Firebase Admin initialized successfully with project:', projectId);
  } else {
    console.warn('firebase-applet-config.json not found and no environment variables supplied. Running in local-only mode.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

const FIRESTORE_COLLECTION = 'app_state';
const FIRESTORE_DOCUMENT = 'inventory_db';

// Load state from Firestore
async function loadStateFromFirestore() {
  if (!firebaseDb) return;
  try {
    console.log('Fetching database state from Firestore...');
    const docRef = firebaseDb.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOCUMENT);
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data() as InventoryDB;
      if (data && data.users && data.items) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('Successfully loaded and cached database state from Firestore!');
      }
    } else {
      console.log('No state found in Firestore. Initializing Firestore with default demo state...');
      await docRef.set(initialDB);
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf8');
    }
  } catch (error) {
    console.error('Error fetching state from Firestore:', error);
  }
}

// Save state to Firestore
async function saveStateToFirestore(db: InventoryDB) {
  if (!firebaseDb) return;
  try {
    const docRef = firebaseDb.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOCUMENT);
    await docRef.set(db);
    console.log('Successfully synchronized database state to Firestore!');
  } catch (error) {
    console.error('Failed to save state to Firestore:', error);
  }
}

// Helper to read DB
function readDB(): InventoryDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to read db.json, using initial state:', error);
  }
  // Write initial state if not present
  writeDB(initialDB);
  return initialDB;
}

// Helper to write DB
function writeDB(db: InventoryDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    saveStateToFirestore(db).catch(err => {
      console.error('Async saveStateToFirestore failed:', err);
    });
  } catch (error) {
    console.error('Failed to write db.json:', error);
  }
}

// Auth Middleware using X-User-Email header for high reliability inside iframe
function getAuthenticatedUser(req: express.Request): User | null {
  const email = req.headers['x-user-email'] as string;
  if (!email) return null;

  const db = readDB();
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Hardcode pousan888@gmail.com as super admin
  if (email.toLowerCase() === 'pousan888@gmail.com') {
    if (!user) {
      user = { id: '1', email: 'pousan888@gmail.com', name: 'Pousan Admin', role: 'admin' };
      db.users.push(user);
      writeDB(db);
    } else if (user.role !== 'admin') {
      user.role = 'admin';
      writeDB(db);
    }
  } else if (!user) {
    // Automatically register other emails as helper if they invoke API requests
    user = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      name: email.split('@')[0],
      role: 'helper'
    };
    db.users.push(user);
    writeDB(db);
  }

  return user || null;
}

// --- API ENDPOINTS ---

// Get DB state
app.get('/api/state', (req, res) => {
  const db = readDB();
  res.json(db);
});

// Reset DB helper
app.post('/api/reset', (req, res) => {
  writeDB(initialDB);
  res.json({ message: 'Database reset to initial state successfully', db: initialDB });
});

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const db = readDB();
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // If the user logging in is the hardcoded super admin
    const isSuperAdmin = email.toLowerCase() === 'pousan888@gmail.com';
    user = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: isSuperAdmin ? 'admin' : 'helper' // New signups default to helper
    };
    db.users.push(user);
    writeDB(db);
  }

  res.json(user);
});

// Get current user profile
app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(user);
});

// Users management (Admin only)
app.get('/api/users', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }
  const db = readDB();
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }
  
  const { email, name, role, departmentId } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role are required' });
  }

  const db = readDB();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser: User = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    name: name || email.split('@')[0],
    role,
    departmentId
  };

  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { id } = req.params;
  const { name, role, departmentId, email } = req.body;

  const db = readDB();
  const userIdx = db.users.findIndex(u => u.id === id);
  if (userIdx === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent modifying the super admin's role
  if (db.users[userIdx].email.toLowerCase() === 'pousan888@gmail.com' && role !== 'admin') {
    return res.status(400).json({ error: 'Cannot downgrade pousan888@gmail.com from Admin.' });
  }

  db.users[userIdx] = {
    ...db.users[userIdx],
    name: name !== undefined ? name : db.users[userIdx].name,
    role: role !== undefined ? role : db.users[userIdx].role,
    departmentId: departmentId !== undefined ? departmentId : db.users[userIdx].departmentId,
    email: email !== undefined ? email.toLowerCase() : db.users[userIdx].email
  };

  writeDB(db);
  res.json(db.users[userIdx]);
});

app.delete('/api/users/:id', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { id } = req.params;
  const db = readDB();
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.email.toLowerCase() === 'pousan888@gmail.com') {
    return res.status(400).json({ error: 'Cannot delete pousan888@gmail.com super admin.' });
  }

  db.users = db.users.filter(u => u.id !== id);
  writeDB(db);
  res.json({ message: 'User deleted successfully' });
});

// Update user language preference
app.post('/api/users/language', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { language } = req.body;
  if (language !== 'th' && language !== 'en') {
    return res.status(400).json({ error: 'Invalid language' });
  }
  const db = readDB();
  const dbUser = db.users.find(u => u.id === user.id);
  if (dbUser) {
    dbUser.language = language;
    writeDB(db);
    return res.json({ success: true, language: dbUser.language });
  }
  res.status(404).json({ error: 'User not found' });
});

// Cabinets CRUD (Admin only)
app.get('/api/cabinets', (req, res) => {
  const db = readDB();
  res.json(db.cabinets);
});

app.post('/api/cabinets', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { name, location } = req.body;
  if (!name || !location) {
    return res.status(400).json({ error: 'Name and location are required' });
  }

  const db = readDB();
  const newCabinet: Cabinet = {
    id: 'cab_' + Math.random().toString(36).substr(2, 9),
    name,
    location
  };

  db.cabinets.push(newCabinet);
  writeDB(db);
  res.status(201).json(newCabinet);
});

app.put('/api/cabinets/:id', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { id } = req.params;
  const { name, location } = req.body;

  const db = readDB();
  const idx = db.cabinets.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Cabinet not found' });
  }

  db.cabinets[idx] = {
    ...db.cabinets[idx],
    name: name || db.cabinets[idx].name,
    location: location || db.cabinets[idx].location
  };

  writeDB(db);
  res.json(db.cabinets[idx]);
});

app.delete('/api/cabinets/:id', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { id } = req.params;
  const db = readDB();
  const idx = db.cabinets.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Cabinet not found' });
  }

  // Delete all items inside this cabinet or reassign them? Let's delete items or leave them orphaned?
  // Let's filter out items inside this cabinet to prevent dead data.
  db.items = db.items.filter(item => item.cabinetId !== id);
  db.cabinets = db.cabinets.filter(c => c.id !== id);

  writeDB(db);
  res.json({ message: 'Cabinet and its items deleted successfully' });
});

// Departments CRUD (Admin only)
app.get('/api/departments', (req, res) => {
  const db = readDB();
  res.json(db.departments);
});

app.post('/api/departments', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Department name is required' });
  }

  const db = readDB();
  const newDept: Department = {
    id: 'dept_' + Math.random().toString(36).substr(2, 9),
    name
  };

  db.departments.push(newDept);
  writeDB(db);
  res.status(201).json(newDept);
});

app.put('/api/departments/:id', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { id } = req.params;
  const { name } = req.body;

  const db = readDB();
  const idx = db.departments.findIndex(d => d.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Department not found' });
  }

  db.departments[idx].name = name || db.departments[idx].name;
  writeDB(db);
  res.json(db.departments[idx]);
});

app.delete('/api/departments/:id', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { id } = req.params;
  const db = readDB();
  const idx = db.departments.findIndex(d => d.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Department not found' });
  }

  // Keep items but set department to "Unassigned" or similar? Let's just remove items of this department
  db.items = db.items.filter(item => item.departmentId !== id);
  db.departments = db.departments.filter(d => d.id !== id);

  writeDB(db);
  res.json({ message: 'Department and its items deleted successfully' });
});

// Consumable Items CRUD (Admin can do CRUD, anyone can Read)
app.get('/api/items', (req, res) => {
  const db = readDB();
  res.json(db.items);
});

app.post('/api/items', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { name, imageUrl, departmentId, cabinetId, currentStock, minThreshold, unit } = req.body;
  if (!name || !departmentId || !cabinetId || currentStock === undefined || minThreshold === undefined || !unit) {
    return res.status(400).json({ error: 'Missing required item fields' });
  }

  const db = readDB();
  const newItem: ConsumableItem = {
    id: 'item_' + Math.random().toString(36).substr(2, 9),
    name,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=150&auto=format&fit=crop&q=60',
    departmentId,
    cabinetId,
    currentStock: Number(currentStock),
    minThreshold: Number(minThreshold),
    previousStock: Number(currentStock), // Default previous stock to initial stock
    unit
  };

  db.items.push(newItem);
  writeDB(db);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { id } = req.params;
  const { name, imageUrl, departmentId, cabinetId, currentStock, minThreshold, previousStock, unit } = req.body;

  const db = readDB();
  const idx = db.items.findIndex(item => item.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  db.items[idx] = {
    ...db.items[idx],
    name: name || db.items[idx].name,
    imageUrl: imageUrl !== undefined ? imageUrl : db.items[idx].imageUrl,
    departmentId: departmentId || db.items[idx].departmentId,
    cabinetId: cabinetId || db.items[idx].cabinetId,
    currentStock: currentStock !== undefined ? Number(currentStock) : db.items[idx].currentStock,
    minThreshold: minThreshold !== undefined ? Number(minThreshold) : db.items[idx].minThreshold,
    previousStock: previousStock !== undefined ? Number(previousStock) : db.items[idx].previousStock,
    unit: unit || db.items[idx].unit
  };

  writeDB(db);
  res.json(db.items[idx]);
});

app.delete('/api/items/:id', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized. Admin only.' });
  }

  const { id } = req.params;
  const db = readDB();
  const idx = db.items.findIndex(item => item.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  db.items = db.items.filter(item => item.id !== id);
  writeDB(db);
  res.json({ message: 'Item deleted successfully' });
});

// Helper Save/Inspection Log counts
app.post('/api/logs/inspection', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (authUser.role !== 'admin' && authUser.role !== 'helper') {
    return res.status(403).json({ error: 'Unauthorized. Helper or Admin required.' });
  }

  const { cabinetId, counts } = req.body; // counts: { [itemId: string]: number }
  if (!cabinetId || !counts) {
    return res.status(400).json({ error: 'Cabinet ID and counted quantities are required' });
  }

  const db = readDB();
  const cabinet = db.cabinets.find(c => c.id === cabinetId);
  if (!cabinet) {
    return res.status(404).json({ error: 'Cabinet not found' });
  }

  const itemsCounted: InspectionLog['itemsCounted'] = [];

  // Loop through items and update stock
  db.items.forEach(item => {
    if (item.cabinetId === cabinetId && counts[item.id] !== undefined) {
      const newCount = Number(counts[item.id]);
      const prev = item.currentStock;

      itemsCounted.push({
        itemId: item.id,
        countedQuantity: newCount,
        previousQuantity: prev
      });

      // Crucial requirement: Compare current stock with the previous inspection cycle.
      // So previous stock is set to the stock *before* this count, and current stock becomes the counted value.
      item.previousStock = prev;
      item.currentStock = newCount;
    }
  });

  const newLog: InspectionLog = {
    id: 'insp_' + Math.random().toString(36).substr(2, 9),
    cabinetId,
    userId: authUser.id,
    userName: authUser.name,
    timestamp: new Date().toISOString(),
    itemsCounted
  };

  db.inspectionLogs.push(newLog);
  writeDB(db);
  res.status(201).json({ message: 'Inspection count synchronized successfully', log: newLog, items: db.items });
});

// QC Save/Consumption Log pulls
app.post('/api/logs/consumption', (req, res) => {
  const authUser = getAuthenticatedUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (authUser.role !== 'admin' && authUser.role !== 'qc') {
    return res.status(403).json({ error: 'Unauthorized. QC or Admin required.' });
  }

  const { itemId, quantityConsumed, purpose } = req.body;
  if (!itemId || !quantityConsumed || Number(quantityConsumed) <= 0 || !purpose) {
    return res.status(400).json({ error: 'Item, positive quantity, and purpose are required' });
  }

  const db = readDB();
  const item = db.items.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const consumedQty = Number(quantityConsumed);
  if (item.currentStock < consumedQty) {
    return res.status(400).json({ error: `Insufficient stock. Current stock is ${item.currentStock} ${item.unit}.` });
  }

  // Subtract stock
  item.currentStock -= consumedQty;

  const cabinet = db.cabinets.find(c => c.id === item.cabinetId);
  const dept = db.departments.find(d => d.id === item.departmentId);

  const newLog: ConsumptionLog = {
    id: 'cons_' + Math.random().toString(36).substr(2, 9),
    itemId,
    itemName: item.name,
    cabinetId: item.cabinetId,
    cabinetName: cabinet ? cabinet.name : 'Unknown Cabinet',
    userId: authUser.id,
    userName: authUser.name,
    departmentId: item.departmentId,
    departmentName: dept ? dept.name : 'Unknown Department',
    timestamp: new Date().toISOString(),
    quantityConsumed: consumedQty,
    purpose
  };

  db.consumptionLogs.push(newLog);
  writeDB(db);
  res.status(201).json({ message: 'Consumption logged successfully', log: newLog, item });
});

// --- CLIENT SETUP & ROUTING ---

async function startServer() {
  // Load state from Firestore on startup
  await loadStateFromFirestore();

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static client files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
