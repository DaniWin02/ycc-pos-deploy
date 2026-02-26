import { BaseEntity } from './index';

// Tiendas
export interface Store extends BaseEntity {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  manager: string;
  managerPhone: string;
  managerEmail: string;
  openingTime: string;
  closingTime: string;
  timezone: string;
  currency: string;
  taxRate: number;
  isActive: boolean;
  settings: StoreSettings;
  inventory: StoreInventory;
}

export interface StoreSettings {
  allowNegativeStock: boolean;
  requireManagerApproval: boolean;
  autoBackup: boolean;
  backupFrequency: number; // horas
  receiptFooter: string;
  lowStockAlerts: boolean;
  expiryAlerts: boolean;
  dailyReports: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

export interface StoreInventory {
  lastCountDate?: Date;
  nextCountDate?: Date;
  countFrequency: number; // días
  varianceThreshold: number; // porcentaje
  autoApproveCounts: boolean;
  trackExpiry: boolean;
  expiryWarningDays: number;
}

export interface StoreCreateRequest {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  manager: string;
  managerPhone: string;
  managerEmail: string;
  openingTime: string;
  closingTime: string;
  timezone: string;
  currency: string;
  taxRate: number;
  isActive?: boolean;
  settings?: Partial<StoreSettings>;
  inventory?: Partial<StoreInventory>;
}

export interface StoreUpdateRequest {
  name?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  manager?: string;
  managerPhone?: string;
  managerEmail?: string;
  openingTime?: string;
  closingTime?: string;
  timezone?: string;
  currency?: string;
  taxRate?: number;
  isActive?: boolean;
  settings?: Partial<StoreSettings>;
  inventory?: Partial<StoreInventory>;
}

// Inventario por Tienda
export interface StoreInventory extends BaseEntity {
  storeId: string;
  ingredientId: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  lastUpdated: Date;
  lastCountDate?: Date;
  expiryDate?: Date;
  batchNumber?: string;
  location?: string;
  status: StockStatus;
}

// Importar tipos necesarios
import { StockStatus } from './inventory.types';
