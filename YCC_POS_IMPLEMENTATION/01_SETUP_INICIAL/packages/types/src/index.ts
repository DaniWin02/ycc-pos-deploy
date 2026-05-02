export * from './inventory.types';
export * from './kds.types';
export * from './menu.types';
export * from './order.types';
export * from './recipes.types';
export * from './store.types';

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

export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  MANAGER = 'MANAGER',
  KITCHEN = 'KITCHEN',
  WAITER = 'WAITER',
  DELIVERY = 'DELIVERY',
  CHEF = 'CHEF',
  SUPERVISOR = 'SUPERVISOR',
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  pin?: string;
  password?: string;
  canAccessPos?: boolean;
  canAccessKds?: boolean;
  canAccessAdmin?: boolean;
  isActive: boolean;
  permissions?: unknown;
  phone?: string;
  avatar?: string;
  lastLogin?: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Terminal extends BaseEntity {
  storeId: string;
  name: string;
  location: string;
  isActive: boolean;
}

export interface CashSession extends BaseEntity {
  terminalId: string;
  openedByUserId: string;
  closedByUserId?: string;
  openingFloat: number;
  closingFloat?: number;
  status: CashSessionStatus;
  openedAt: Date;
  closedAt?: Date;
}

export enum CashSessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}
