import { User, UserRole, Product, Order, Store, Terminal } from '@ycc/types';

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR'
}

export enum AdminPermission {
  // Users
  USERS_READ = 'USERS_READ',
  USERS_WRITE = 'USERS_WRITE',
  USERS_DELETE = 'USERS_DELETE',
  
  // Products
  PRODUCTS_READ = 'PRODUCTS_READ',
  PRODUCTS_WRITE = 'PRODUCTS_WRITE',
  PRODUCTS_DELETE = 'PRODUCTS_DELETE',
  
  // Orders
  ORDERS_READ = 'ORDERS_READ',
  ORDERS_WRITE = 'ORDERS_WRITE',
  ORDERS_DELETE = 'ORDERS_DELETE',
  
  // Reports
  REPORTS_READ = 'REPORTS_READ',
  REPORTS_EXPORT = 'REPORTS_EXPORT',
  
  // Settings
  SETTINGS_READ = 'SETTINGS_READ',
  SETTINGS_WRITE = 'SETTINGS_WRITE',
  
  // System
  SYSTEM_MONITOR = 'SYSTEM_MONITOR',
  SYSTEM_LOGS = 'SYSTEM_LOGS'
}

export interface AdminUser extends User {
  adminRole: AdminRole;
  permissions: AdminPermission[];
  lastLogin?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  todaySales: number;
  todayOrders: number;
  activeUsers: number;
  pendingOrders: number;
  lowStockProducts: number;
  systemHealth: 'HEALTHY' | 'WARNING' | 'ERROR';
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
  customers: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  sku: string;
  totalSold: number;
  totalRevenue: number;
  category: string;
}

export interface RecentOrder {
  id: string;
  folio: string;
  customerName?: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  terminalId: string;
  userId: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole | AdminRole;
  isActive?: boolean;
  storeId?: string;
  createdFrom?: Date;
  createdTo?: Date;
  lastLoginFrom?: Date;
  lastLoginTo?: Date;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  lowStock?: boolean;
  storeId?: string;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  storeId?: string;
  terminalId?: string;
  userId?: string;
  customerId?: string;
  createdFrom?: Date;
  createdTo?: Date;
  amountMin?: number;
  amountMax?: number;
}

export interface ReportFilters {
  type: 'sales' | 'inventory' | 'financial' | 'custom';
  storeId?: string;
  dateFrom: Date;
  dateTo: Date;
  groupBy?: 'day' | 'week' | 'month' | 'year';
  format?: 'json' | 'pdf' | 'excel';
}

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  category: string;
  isPublic: boolean;
  updatedBy: string;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface AdminStore {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  timezone: string;
  currency: string;
  taxRate: number;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminTerminal {
  id: string;
  storeId: string;
  name: string;
  isActive: boolean;
  location: string;
  settings: Record<string, any>;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para formularios
export interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | AdminRole;
  password?: string;
  confirmPassword?: string;
  isActive: boolean;
  permissions?: AdminPermission[];
}

export interface ProductFormData {
  name: string;
  sku: string;
  description?: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  image?: string;
  modifiers?: string[];
}

export interface StoreFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  currency: string;
  taxRate: number;
  isActive: boolean;
}

export interface TerminalFormData {
  storeId: string;
  name: string;
  location: string;
  isActive: boolean;
  settings: Record<string, any>;
}

// Helper functions para permisos
export const hasPermission = (
  user: AdminUser,
  permission: AdminPermission
): boolean => {
  return user.permissions.includes(permission);
};

export const hasAnyPermission = (
  user: AdminUser,
  permissions: AdminPermission[]
): boolean => {
  return permissions.some(permission => user.permissions.includes(permission));
};

export const hasAllPermissions = (
  user: AdminUser,
  permissions: AdminPermission[]
): boolean => {
  return permissions.every(permission => user.permissions.includes(permission));
};

export const canManageUsers = (user: AdminUser): boolean => {
  return hasAnyPermission(user, [
    AdminPermission.USERS_READ,
    AdminPermission.USERS_WRITE,
    AdminPermission.USERS_DELETE
  ]);
};

export const canManageProducts = (user: AdminUser): boolean => {
  return hasAnyPermission(user, [
    AdminPermission.PRODUCTS_READ,
    AdminPermission.PRODUCTS_WRITE,
    AdminPermission.PRODUCTS_DELETE
  ]);
};

export const canViewReports = (user: AdminUser): boolean => {
  return hasPermission(user, AdminPermission.REPORTS_READ);
};

export const canExportReports = (user: AdminUser): boolean => {
  return hasPermission(user, AdminPermission.REPORTS_EXPORT);
};

export const canManageSettings = (user: AdminUser): boolean => {
  return hasAnyPermission(user, [
    AdminPermission.SETTINGS_READ,
    AdminPermission.SETTINGS_WRITE
  ]);
};
