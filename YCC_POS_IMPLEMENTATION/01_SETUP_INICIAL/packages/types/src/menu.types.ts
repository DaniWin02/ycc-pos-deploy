import { BaseEntity } from './index';

// Categorías del Menú
export interface MenuCategory extends BaseEntity {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string;
  children?: MenuCategory[];
}

export interface MenuCategoryCreateRequest {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  imageUrl?: string;
}

export interface MenuCategoryUpdateRequest {
  name?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  imageUrl?: string;
}

// Items del Menú
export interface MenuItem extends BaseEntity {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  cost?: number;
  taxRate: number;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  isAvailable: boolean;
  trackInventory: boolean;
  preparationTime?: number; // minutos
  calories?: number;
  allergens?: string[];
  dietaryRestrictions?: string[];
  modifiers?: MenuItemModifier[];
  recipe?: MenuItemRecipeItem[];
}

export interface MenuItemCreateRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  cost?: number;
  taxRate?: number;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  trackInventory?: boolean;
  preparationTime?: number;
  calories?: number;
  allergens?: string[];
  dietaryRestrictions?: string[];
}

export interface MenuItemUpdateRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  cost?: number;
  taxRate?: number;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  trackInventory?: boolean;
  preparationTime?: number;
  calories?: number;
  allergens?: string[];
  dietaryRestrictions?: string[];
}

// Modificadores
export interface MenuItemModifier extends BaseEntity {
  menuItemId: string;
  modifierGroupId: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  modifierGroup?: ModifierGroup;
}

export interface ModifierGroup extends BaseEntity {
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  options?: ModifierOption[];
}

export interface ModifierOption extends BaseEntity {
  modifierGroupId: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  sortOrder: number;
  isActive: boolean;
  isAvailable: boolean;
}

export interface ModifierGroupCreateRequest {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ModifierGroupUpdateRequest {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ModifierOptionCreateRequest {
  modifierGroupId: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  sortOrder?: number;
  isActive?: boolean;
  isAvailable?: boolean;
}

export interface ModifierOptionUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  sortOrder?: number;
  isActive?: boolean;
  isAvailable?: boolean;
}

// Receta y Costos
export interface MenuItemRecipeItem extends BaseEntity {
  menuItemId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  cost?: number;
  ingredient?: Ingredient;
}

export interface MenuItemRecipeItemCreateRequest {
  menuItemId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
}

export interface MenuItemRecipeItemUpdateRequest {
  quantity?: number;
  unit?: string;
}

export interface Ingredient extends BaseEntity {
  name: string;
  description?: string;
  unit: string;
  currentCost: number;
  supplier?: string;
  isActive: boolean;
}

export interface MenuItemCostCalculation {
  menuItemId: string;
  recipeCost: number;
  foodCostPercentage: number;
  margin: number;
  marginPercentage: number;
  status: MenuFoodCostStatus;
}

// Filtros y Búsqueda
export interface MenuItemFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  hasModifiers?: boolean;
  trackInventory?: boolean;
}

export interface MenuCategoryFilters {
  search?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface ModifierGroupFilters {
  search?: string;
  isActive?: boolean;
}

// Respuestas de API
export interface MenuItemListResponse {
  items: MenuItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MenuCategoryTreeResponse {
  categories: MenuCategory[];
  total: number;
}

export interface ModifierGroupListResponse {
  groups: ModifierGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para UI
export interface MenuItemFormData {
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  cost: number;
  taxRate: number;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  isAvailable: boolean;
  trackInventory: boolean;
  preparationTime: number;
  calories: number;
  allergens: string[];
  dietaryRestrictions: string[];
}

export interface MenuCategoryFormData {
  name: string;
  description: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string;
}

export interface ModifierGroupFormData {
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ModifierOptionFormData {
  name: string;
  description: string;
  price: number;
  cost: number;
  sortOrder: number;
  isActive: boolean;
  isAvailable: boolean;
}

// Estados de UI
export enum MenuItemStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  UNAVAILABLE = 'UNAVAILABLE'
}

export enum MenuFoodCostStatus {
  GOOD = 'good', // < 30%
  WARNING = 'warning', // 30-35%
  CRITICAL = 'critical' // > 35%
}

// Utilidades
export interface DragDropItem {
  id: string;
  type: 'category' | 'item';
  parentId?: string;
  sortOrder: number;
}

export interface MenuStats {
  totalItems: number;
  activeItems: number;
  totalCategories: number;
  activeCategories: number;
  averagePrice: number;
  averageFoodCost: number;
}
