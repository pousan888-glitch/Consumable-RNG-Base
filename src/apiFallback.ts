/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryDB, User, Cabinet, Department, ConsumableItem, InspectionLog, ConsumptionLog, UserRole } from './types.js';

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

const LOCAL_STORAGE_KEY = 'local_consumables_db';

function readDB(): InventoryDB {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialDB));
    return JSON.parse(JSON.stringify(initialDB));
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialDB));
    return JSON.parse(JSON.stringify(initialDB));
  }
}

function writeDB(db: InventoryDB) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
}

function getAuthenticatedUser(email: string | null): User | null {
  if (!email) return null;
  const db = readDB();
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

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

export async function handleMockFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const headers = init?.headers as Record<string, string> || {};
  const userEmailHeader = headers['X-User-Email'] || headers['x-user-email'] || null;

  let body: any = null;
  if (init?.body) {
    try {
      body = JSON.parse(init.body as string);
    } catch (e) {}
  }

  // Helper to construct a Response object
  const makeResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  // --- API ROUTER MOCK ---

  // 1. GET /api/state
  if (url === '/api/state' && method === 'GET') {
    return makeResponse(readDB());
  }

  // 2. POST /api/reset
  if (url === '/api/reset' && method === 'POST') {
    writeDB(initialDB);
    return makeResponse({ message: 'Database reset successfully', db: initialDB });
  }

  // 3. POST /api/auth/login
  if (url === '/api/auth/login' && method === 'POST') {
    const { email, name, role } = body || {};
    if (!email) {
      return makeResponse({ error: 'Email is required' }, 400);
    }

    const db = readDB();
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const isSuperAdmin = email.toLowerCase() === 'pousan888@gmail.com';
      user = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        role: isSuperAdmin ? 'admin' : (role || 'helper')
      };
      db.users.push(user);
      writeDB(db);
    }

    return makeResponse(user);
  }

  // 4. GET /api/auth/me
  if (url === '/api/auth/me' && method === 'GET') {
    const user = getAuthenticatedUser(userEmailHeader);
    if (!user) {
      return makeResponse({ error: 'Not authenticated' }, 401);
    }
    return makeResponse(user);
  }

  // 5. GET /api/users
  if (url === '/api/users' && method === 'GET') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }
    return makeResponse(readDB().users);
  }

  // 6. POST /api/users
  if (url === '/api/users' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const { email, name, role, departmentId } = body || {};
    if (!email || !role) {
      return makeResponse({ error: 'Email and role are required' }, 400);
    }

    const db = readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return makeResponse({ error: 'User already exists' }, 400);
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
    return makeResponse(newUser, 201);
  }

  // 7. PUT /api/users/:id
  if (url.startsWith('/api/users/') && method === 'PUT') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];
    const { name, role, departmentId } = body || {};

    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return makeResponse({ error: 'User not found' }, 404);
    }

    const updatedUser = {
      ...db.users[userIndex],
      name: name !== undefined ? name : db.users[userIndex].name,
      role: role !== undefined ? role : db.users[userIndex].role,
      departmentId: departmentId !== undefined ? departmentId : db.users[userIndex].departmentId
    };

    db.users[userIndex] = updatedUser;
    writeDB(db);
    return makeResponse(updatedUser);
  }

  // 8. DELETE /api/users/:id
  if (url.startsWith('/api/users/') && method === 'DELETE') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    db.users = db.users.filter(u => u.id !== id);
    writeDB(db);
    return makeResponse({ message: 'User deleted' });
  }

  // 9. POST /api/items
  if (url === '/api/items' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const db = readDB();
    const newItem: ConsumableItem = {
      id: 'item_' + Math.random().toString(36).substr(2, 9),
      name: body.name,
      imageUrl: body.imageUrl,
      departmentId: body.departmentId,
      cabinetId: body.cabinetId,
      currentStock: Number(body.currentStock),
      minThreshold: Number(body.minThreshold),
      previousStock: Number(body.currentStock),
      unit: body.unit
    };

    db.items.push(newItem);
    writeDB(db);
    return makeResponse(newItem, 201);
  }

  // 10. PUT /api/items/:id
  if (url.startsWith('/api/items/') && method === 'PUT') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    const index = db.items.findIndex(i => i.id === id);
    if (index === -1) return makeResponse({ error: 'Item not found' }, 404);

    const updated = {
      ...db.items[index],
      name: body.name,
      imageUrl: body.imageUrl,
      departmentId: body.departmentId,
      cabinetId: body.cabinetId,
      currentStock: Number(body.currentStock),
      minThreshold: Number(body.minThreshold),
      previousStock: body.previousStock !== undefined ? Number(body.previousStock) : db.items[index].previousStock,
      unit: body.unit
    };

    db.items[index] = updated;
    writeDB(db);
    return makeResponse(updated);
  }

  // 11. DELETE /api/items/:id
  if (url.startsWith('/api/items/') && method === 'DELETE') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    db.items = db.items.filter(i => i.id !== id);
    writeDB(db);
    return makeResponse({ message: 'Deleted' });
  }

  // 12. POST /api/cabinets
  if (url === '/api/cabinets' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const db = readDB();
    const newCabinet: Cabinet = {
      id: 'cab_' + Math.random().toString(36).substr(2, 9),
      name: body.name,
      location: body.location
    };

    db.cabinets.push(newCabinet);
    writeDB(db);
    return makeResponse(newCabinet, 201);
  }

  // 13. PUT /api/cabinets/:id
  if (url.startsWith('/api/cabinets/') && method === 'PUT') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    const index = db.cabinets.findIndex(c => c.id === id);
    if (index === -1) return makeResponse({ error: 'Cabinet not found' }, 404);

    const updated = {
      ...db.cabinets[index],
      name: body.name,
      location: body.location
    };

    db.cabinets[index] = updated;
    writeDB(db);
    return makeResponse(updated);
  }

  // 14. DELETE /api/cabinets/:id
  if (url.startsWith('/api/cabinets/') && method === 'DELETE') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    db.cabinets = db.cabinets.filter(c => c.id !== id);
    db.items = db.items.filter(i => i.cabinetId !== id);
    writeDB(db);
    return makeResponse({ message: 'Deleted' });
  }

  // 15. POST /api/departments
  if (url === '/api/departments' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const db = readDB();
    const newDept: Department = {
      id: 'dept_' + Math.random().toString(36).substr(2, 9),
      name: body.name
    };

    db.departments.push(newDept);
    writeDB(db);
    return makeResponse(newDept, 201);
  }

  // 16. PUT /api/departments/:id
  if (url.startsWith('/api/departments/') && method === 'PUT') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    const index = db.departments.findIndex(d => d.id === id);
    if (index === -1) return makeResponse({ error: 'Department not found' }, 404);

    const updated = {
      ...db.departments[index],
      name: body.name
    };

    db.departments[index] = updated;
    writeDB(db);
    return makeResponse(updated);
  }

  // 17. DELETE /api/departments/:id
  if (url.startsWith('/api/departments/') && method === 'DELETE') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser || authUser.role !== 'admin') {
      return makeResponse({ error: 'Unauthorized' }, 403);
    }

    const parts = url.split('/');
    const id = parts[parts.length - 1];

    const db = readDB();
    db.departments = db.departments.filter(d => d.id !== id);
    writeDB(db);
    return makeResponse({ message: 'Deleted' });
  }

  // 18. POST /api/logs/inspection
  if (url === '/api/logs/inspection' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser) {
      return makeResponse({ error: 'Authentication required' }, 401);
    }

    const { cabinetId, counts } = body || {};
    if (!cabinetId || !counts) {
      return makeResponse({ error: 'CabinetId and counts are required' }, 400);
    }

    const db = readDB();
    const cabinet = db.cabinets.find(c => c.id === cabinetId);
    if (!cabinet) {
      return makeResponse({ error: 'Cabinet not found' }, 404);
    }

    const itemsCounted: any[] = [];
    Object.entries(counts).forEach(([itemId, qty]) => {
      const item = db.items.find(i => i.id === itemId);
      if (item) {
        itemsCounted.push({
          itemId,
          countedQuantity: Number(qty),
          previousQuantity: item.currentStock
        });
        item.previousStock = item.currentStock;
        item.currentStock = Number(qty);
      }
    });

    const newLog: InspectionLog = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      cabinetId,
      userId: authUser.id,
      userName: authUser.name,
      timestamp: new Date().toISOString(),
      itemsCounted
    };

    db.inspectionLogs.push(newLog);
    writeDB(db);
    return makeResponse({ message: 'Success', log: newLog, items: db.items }, 201);
  }

  // 19. POST /api/logs/consumption
  if (url === '/api/logs/consumption' && method === 'POST') {
    const authUser = getAuthenticatedUser(userEmailHeader);
    if (!authUser) {
      return makeResponse({ error: 'Authentication required' }, 401);
    }

    const { itemId, quantityConsumed, purpose } = body || {};
    if (!itemId || !quantityConsumed || Number(quantityConsumed) <= 0 || !purpose) {
      return makeResponse({ error: 'Required fields missing' }, 400);
    }

    const db = readDB();
    const item = db.items.find(i => i.id === itemId);
    if (!item) {
      return makeResponse({ error: 'Item not found' }, 404);
    }

    const consumedQty = Number(quantityConsumed);
    if (item.currentStock < consumedQty) {
      return makeResponse({ error: 'Insufficient stock' }, 400);
    }

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
    return makeResponse({ message: 'Success', log: newLog, item }, 201);
  }

  return makeResponse({ error: 'Mock endpoint not found' }, 404);
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
  
  if (url.startsWith('/api/')) {
    const isOnVercel = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
    const forceFallback = localStorage.getItem('force_fallback') === 'true';
    
    if (isOnVercel || forceFallback) {
      return handleMockFetch(url, init);
    }
    
    try {
      const res = await fetch(input, init);
      if (res.status === 404) {
        console.warn(`[API 404] Endpoint not found: ${url}. Activating client-side fallback.`);
        localStorage.setItem('force_fallback', 'true');
        return handleMockFetch(url, init);
      }
      return res;
    } catch (err) {
      console.warn(`[API Error] Request failed to: ${url}. Activating client-side fallback.`, err);
      localStorage.setItem('force_fallback', 'true');
      return handleMockFetch(url, init);
    }
  }
  
  return fetch(input, init);
}

