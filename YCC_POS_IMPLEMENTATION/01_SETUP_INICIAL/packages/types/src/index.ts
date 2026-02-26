// Exportar todos los tipos del sistema YCC POS
export * from './kds.types';
export * from './websocket.types';
export * from './order.types';
// Export all types from the packages
export * from './store.types'
export * from './inventory.types'
export * from './recipes.types';
export * from './store.types';

// Tipos base del sistema
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos de usuario y autenticación
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  MANAGER = 'MANAGER',
  KITCHEN = 'KITCHEN'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Tipos de tienda y configuración
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Terminal {
  id: string;
  storeId: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de sesión de caja
export interface CashSession {
  id: string;
  terminalId: string;
  openedByUserId: string;
  closedByUserId?: string;
  openingFloat: number;
  closingFloat?: number;
  status: CashSessionStatus;
  openedAt: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum CashSessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}
