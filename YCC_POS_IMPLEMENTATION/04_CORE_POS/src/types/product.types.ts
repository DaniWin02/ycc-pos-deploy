import { Product } from '@ycc/types';

export interface ProductWithStock extends Product {
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockLevel: number;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
}

export interface ProductCreateRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  cost?: number;
  taxRate?: number;
  trackInventory?: boolean;
  minStockLevel?: number;
  isActive?: boolean;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  cost?: number;
  taxRate?: number;
  trackInventory?: boolean;
  minStockLevel?: number;
  isActive?: boolean;
}

export interface ProductSearchResult {
  products: ProductWithStock[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  cost?: number;
  taxRate: number;
  trackInventory: boolean;
  currentStock: number;
  minStockLevel: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    description?: string;
  parentId?: string;
  isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}
