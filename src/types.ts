/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'helper' | 'qc';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId?: string; // helpers or QCs might be assigned to a department
  language?: 'th' | 'en'; // user preferred language
}

export interface Cabinet {
  id: string;
  name: string;
  location: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface ConsumableItem {
  id: string;
  name: string;
  imageUrl?: string;
  departmentId: string; // The department owning this item
  cabinetId: string;    // The cabinet where it is stored
  currentStock: number;
  minThreshold: number; // For low-stock alerts
  previousStock: number; // Previous inspection cycle stock for comparison
  unit: string;         // e.g. "pcs", "boxes", "bottles", "rolls"
}

export interface InspectionLog {
  id: string;
  cabinetId: string;
  userId: string;
  userName: string;
  timestamp: string; // ISO string
  itemsCounted: {
    itemId: string;
    countedQuantity: number;
    previousQuantity: number;
  }[];
}

export interface ConsumptionLog {
  id: string;
  itemId: string;
  itemName: string;
  cabinetId: string;
  cabinetName: string;
  userId: string;
  userName: string;
  departmentId: string; // Department whose allocation was consumed
  departmentName: string;
  timestamp: string; // ISO string
  quantityConsumed: number;
  purpose: string;
}

export interface InventoryDB {
  users: User[];
  cabinets: Cabinet[];
  departments: Department[];
  items: ConsumableItem[];
  inspectionLogs: InspectionLog[];
  consumptionLogs: ConsumptionLog[];
}
