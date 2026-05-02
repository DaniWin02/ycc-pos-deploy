import type { Order } from './order.types';

export interface Customer {
  id: string;
  memberNumber?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  orders: Order[];
}

export interface CustomerSearchFilters {
  search?: string;
  isActive?: boolean;
  memberNumber?: string;
}

export interface CustomerSearchResult {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerCreateRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  memberNumber?: string;
  isActive?: boolean;
}

export interface CustomerUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}
