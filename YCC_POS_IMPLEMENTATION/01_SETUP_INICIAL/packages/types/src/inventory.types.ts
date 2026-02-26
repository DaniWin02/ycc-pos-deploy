import { BaseEntity } from './index';

// Ingredientes de Inventario
export interface InventoryIngredient extends BaseEntity {
  name: string;
  description?: string;
  sku: string;
  unit: string; // kg, g, l, ml, pcs, etc.
  currentCost: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplierId?: string;
  categoryId?: string;
  isActive: boolean;
  trackExpiry: boolean;
  averageCost: number; // Costo promedio ponderado
  lastCostUpdate: Date;
  imageUrl?: string;
  allergenInfo?: string[];
  storageInfo?: string;
  shelfLife?: number; // días
  barcode?: string;
  weight?: number; // peso por unidad
  volume?: number; // volumen por unidad
  supplier?: any;
  category?: any;
  stockLevels?: StoreStockLevel[];
}

export interface InventoryIngredientCreateRequest {
  name: string;
  description?: string;
  sku: string;
  unit: string;
  currentCost: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplierId?: string;
  categoryId?: string;
  isActive?: boolean;
  trackExpiry?: boolean;
  imageUrl?: string;
  allergenInfo?: string[];
  storageInfo?: string;
  shelfLife?: number;
  barcode?: string;
  weight?: number;
  volume?: number;
}

export interface InventoryIngredientUpdateRequest {
  name?: string;
  description?: string;
  sku?: string;
  unit?: string;
  currentCost?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  supplierId?: string;
  categoryId?: string;
  isActive?: boolean;
  trackExpiry?: boolean;
  imageUrl?: string;
  allergenInfo?: string[];
  storageInfo?: string;
  shelfLife?: number;
  barcode?: string;
  weight?: number;
  volume?: number;
}

// Categorías de Ingredientes
export interface IngredientCategory extends BaseEntity {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string;
  children?: any[];
}

export interface IngredientCategoryCreateRequest {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  imageUrl?: string;
}

// Niveles de Stock por Tienda
export interface StoreStockLevel extends BaseEntity {
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
  store?: any;
  ingredient?: any;
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  RESERVED = 'RESERVED'
}

// Proveedores
export interface Supplier extends BaseEntity {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId: string;
  paymentTerms: string;
  deliveryDays: number;
  minOrderAmount: number;
  isActive: boolean;
  notes?: string;
  rating?: number;
  categories?: string[];
}

export interface SupplierCreateRequest {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId: string;
  paymentTerms: string;
  deliveryDays: number;
  minOrderAmount: number;
  isActive?: boolean;
  notes?: string;
  rating?: number;
  categories?: string[];
}

export interface SupplierUpdateRequest {
  name?: string;
  code?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  paymentTerms?: string;
  deliveryDays?: number;
  minOrderAmount?: number;
  isActive?: boolean;
  notes?: string;
  rating?: number;
  categories?: string[];
}

// Órdenes de Compra
export interface PurchaseOrder extends BaseEntity {
  orderNumber: string;
  supplierId: string;
  storeId: string;
  status: PurchaseOrderStatus;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  internalNotes?: string;
  createdBy: string;
  approvedBy?: string;
  receivedBy?: string;
  items: PurchaseOrderItem[];
  supplier?: any;
  store?: any;
  creator?: any;
  approver?: any;
  receiver?: any;
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  PARTIAL_RECEIVED = 'PARTIAL_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export interface PurchaseOrderItem extends BaseEntity {
  purchaseOrderId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  remainingQuantity: number;
  notes?: string;
  ingredient?: any;
}

export interface PurchaseOrderCreateRequest {
  supplierId: string;
  storeId: string;
  expectedDeliveryDate: Date;
  notes?: string;
  internalNotes?: string;
  items: Omit<PurchaseOrderItem, 'id' | 'purchaseOrderId' | 'totalPrice' | 'receivedQuantity' | 'remainingQuantity' | 'createdAt' | 'updatedAt'>[];
}

export interface PurchaseOrderUpdateRequest {
  status?: PurchaseOrderStatus;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  internalNotes?: string;
  approvedBy?: string;
  items?: Omit<PurchaseOrderItem, 'id' | 'purchaseOrderId' | 'createdAt' | 'updatedAt'>[];
}

// Recepción de Compras
export interface PurchaseOrderReceiveRequest {
  purchaseOrderId: string;
  receivedDate: Date;
  receivedBy: string;
  notes?: string;
  items: PurchaseOrderReceiveItem[];
}

export interface PurchaseOrderReceiveItem {
  purchaseOrderItemId: string;
  receivedQuantity: number;
  unitCost?: number;
  expiryDate?: Date;
  batchNumber?: string;
  location?: string;
  notes?: string;
}

// Conteos Físicos
export interface PhysicalCount extends BaseEntity {
  countNumber: string;
  storeId: string;
  status: PhysicalCountStatus;
  countDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  countedBy: string;
  reviewedBy?: string;
  notes?: string;
  varianceAmount: number;
  variancePercentage: number;
  totalItems: number;
  countedItems: number;
  items: PhysicalCountItem[];
  store?: any;
  counter?: any;
  reviewer?: any;
}

export enum PhysicalCountStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED'
}

export interface PhysicalCountItem extends BaseEntity {
  physicalCountId: string;
  ingredientId: string;
  systemStock: number;
  countedStock: number;
  variance: number;
  variancePercentage: number;
  unitCost: number;
  varianceValue: number;
  notes?: string;
  ingredient?: any;
}

export interface PhysicalCountCreateRequest {
  storeId: string;
  countDate: Date;
  notes?: string;
  items: Omit<PhysicalCountItem, 'id' | 'physicalCountId' | 'variance' | 'variancePercentage' | 'varianceValue' | 'createdAt' | 'updatedAt'>[];
}

// Desperdicios
export interface WasteRecord extends BaseEntity {
  recordNumber: string;
  storeId: string;
  wasteDate: Date;
  reason: WasteReason;
  description: string;
  totalValue: number;
  recordedBy: string;
  approvedBy?: string;
  status: WasteStatus;
  items: WasteItem[];
  store?: any;
  recorder?: any;
  approver?: any;
}

export enum WasteReason {
  EXPIRED = 'EXPIRED',
  DAMAGED = 'DAMAGED',
  PREPARATION_ERROR = 'PREPARATION_ERROR',
  OVERPORTION = 'OVERPORTION',
  CUSTOMER_RETURN = 'CUSTOMER_RETURN',
  THEFT = 'THEFT',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  OTHER = 'OTHER'
}

export enum WasteStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface WasteItem extends BaseEntity {
  wasteRecordId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  notes?: string;
  ingredient?: any;
}

export interface WasteRecordCreateRequest {
  storeId: string;
  wasteDate: Date;
  reason: WasteReason;
  description: string;
  recordedBy: string;
  items: Omit<WasteItem, 'id' | 'wasteRecordId' | 'totalValue' | 'createdAt' | 'updatedAt'>[];
}

// Movimientos de Inventario
export interface InventoryMovement extends BaseEntity {
  movementNumber: string;
  storeId: string;
  ingredientId: string;
  movementType: MovementType;
  quantity: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  referenceType?: MovementReferenceType;
  referenceId?: string;
  referenceNumber?: string;
  reason: string;
  notes?: string;
  movedBy: string;
  movementDate: Date;
  previousStock: number;
  newStock: number;
  store?: any;
  ingredient?: any;
  mover?: any;
}

export enum MovementType {
  PURCHASE = 'PURCHASE',
  RECEIPT = 'RECEIPT',
  ADJUSTMENT = 'ADJUSTMENT',
  WASTE = 'WASTE',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  SALE = 'SALE',
  PRODUCTION = 'PRODUCTION',
  RETURN = 'RETURN',
  COUNT_ADJUSTMENT = 'COUNT_ADJUSTMENT'
}

export enum MovementReferenceType {
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  WASTE_RECORD = 'WASTE_RECORD',
  PHYSICAL_COUNT = 'PHYSICAL_COUNT',
  TRANSFER = 'TRANSFER',
  SALE = 'SALE',
  PRODUCTION_ORDER = 'PRODUCTION_ORDER'
}

// Filtros y Búsqueda
export interface InventoryIngredientFilters {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  minCost?: number;
  maxCost?: number;
  isActive?: boolean;
  lowStock?: boolean;
  outOfStock?: boolean;
  trackExpiry?: boolean;
}

export interface StockLevelFilters {
  storeId?: string;
  ingredientId?: string;
  status?: StockStatus;
  lowStock?: boolean;
  outOfStock?: boolean;
  expiringSoon?: boolean;
  expired?: boolean;
}

export interface PurchaseOrderFilters {
  storeId?: string;
  supplierId?: string;
  status?: PurchaseOrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface PhysicalCountFilters {
  storeId?: string;
  status?: PhysicalCountStatus;
  dateFrom?: Date;
  dateTo?: Date;
  countedBy?: string;
}

export interface WasteRecordFilters {
  storeId?: string;
  reason?: WasteReason;
  status?: WasteStatus;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface InventoryMovementFilters {
  storeId?: string;
  ingredientId?: string;
  movementType?: MovementType;
  referenceType?: MovementReferenceType;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

// Respuestas de API
export interface InventoryIngredientListResponse {
  ingredients: InventoryIngredient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockLevelListResponse {
  stockLevels: StoreStockLevel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchaseOrderListResponse {
  orders: PurchaseOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PhysicalCountListResponse {
  counts: PhysicalCount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WasteRecordListResponse {
  records: WasteRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InventoryMovementListResponse {
  movements: InventoryMovement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Estadísticas y Reportes
export interface InventoryStats {
  totalIngredients: number;
  activeIngredients: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  expiringSoonItems: number;
  expiredItems: number;
  pendingPurchaseOrders: number;
  pendingWasteRecords: number;
}

export interface StockAlert {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  status: StockStatus;
  unit: string;
  unitCost: number;
  totalValue: number;
  daysOfStock: number;
  reorderQuantity: number;
  lastUpdated: Date;
  storeId: string;
}

export interface InventoryValuation {
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  unitCost: number;
  totalValue: number;
  storeId: string;
  lastUpdated: Date;
}

// Tipos para UI
export interface InventoryIngredientFormData {
  name: string;
  description: string;
  sku: string;
  unit: string;
  currentCost: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplierId: string;
  categoryId: string;
  isActive: boolean;
  trackExpiry: boolean;
  imageUrl: string;
  allergenInfo: string[];
  storageInfo: string;
  shelfLife: number;
  barcode: string;
  weight: number;
  volume: number;
}

export interface SupplierFormData {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId: string;
  paymentTerms: string;
  deliveryDays: number;
  minOrderAmount: number;
  isActive: boolean;
  notes: string;
  rating: number;
  categories: string[];
}

export interface PurchaseOrderFormData {
  supplierId: string;
  storeId: string;
  expectedDeliveryDate: Date;
  notes: string;
  internalNotes: string;
  items: Omit<PurchaseOrderItem, 'id' | 'purchaseOrderId' | 'totalPrice' | 'receivedQuantity' | 'remainingQuantity' | 'createdAt' | 'updatedAt'>[];
}

export interface PhysicalCountFormData {
  storeId: string;
  countDate: Date;
  notes: string;
  items: Omit<PhysicalCountItem, 'id' | 'physicalCountId' | 'variance' | 'variancePercentage' | 'varianceValue' | 'createdAt' | 'updatedAt'>[];
}

export interface WasteRecordFormData {
  storeId: string;
  wasteDate: Date;
  reason: WasteReason;
  description: string;
  items: Omit<WasteItem, 'id' | 'wasteRecordId' | 'totalValue' | 'createdAt' | 'updatedAt'>[];
}

// Importaciones para evitar dependencias circulares
