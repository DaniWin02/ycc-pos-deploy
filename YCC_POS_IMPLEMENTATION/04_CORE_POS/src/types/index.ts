// Tipos autocontenidos para el Core POS del YCC

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MEMBER_ACCOUNT' | 'TRANSFER';
export type OrderStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PREPARING' | 'READY';
export type POSMode = 'COUNTER' | 'TABLE' | 'DELIVERY';
export type OrderType = 'MESA' | 'DOMICILIO' | 'LLEVAR' | 'BARRA';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;       // "Chico", "Mediano", "Grande", "500ml", "1L", "Light", "Zero", "355ml Light"
  sku: string;
  price: number;
  cost?: number;
  currentStock: number;
  image?: string;     // Imagen específica de la variante
  description?: string; // Descripción de la variante (ej: "Sin azúcar", "Bajo en calorías")
  isActive: boolean;
  sortOrder: number;
}

export interface Modifier {
  id: string;
  name: string;            // "Extra Queso", "Sin Cebolla", "Término Medio"
  description?: string;    // "+30g queso manchego"
  priceAdd: number;        // Precio adicional (0 = gratis)
  isActive: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;            // "Ingredientes Extra", "Sin / Quitar", "Término de Carne"
  description?: string;
  isRequired: boolean;     // Si es obligatorio seleccionar al menos uno
  isActive: boolean;
  modifiers: Modifier[];   // Opciones dentro del grupo
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  price: number;       // Precio base o de referencia
  cost?: number;
  taxRate: number;
  image?: string;
  currentStock: number;
  isActive: boolean;
  stationId?: string;
  station?: {
    id: string;
    name: string;
    displayName: string;
    color?: string;
  };
  hasVariants: boolean;  // Indica si tiene variantes
  variantLabel?: string;  // "Tamaño", "Presentación", etc.
  variants?: ProductVariant[]; // Lista de variantes disponibles
  modifierGroups?: ModifierGroup[]; // Grupos de modificadores disponibles
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;      // "Ingredientes Extra"
  modifierId: string;
  modifierName: string;   // "Extra Queso"
  priceAdd: number;       // Precio adicional
}

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  categoryName: string;
  stationId?: string;
  stationName?: string;
  // Variant info (if product has variants)
  variantId?: string;
  variantName?: string;   // "Mediano", "Grande", etc.
  variantLabel?: string;  // "Tamaño", "Presentación", etc.
  // Modifiers (ingredientes extras, sin, término, etc.)
  modifiers?: SelectedModifier[];
  notes?: string;         // Notas especiales del cliente
}

export interface CartTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  itemCount: number;
}

export interface Customer {
  id: string;
  name: string;
  memberNumber?: string;
  email?: string;
  phone?: string;
}

export interface CashSession {
  id: string;
  terminalId: string;
  openedBy: string;
  openingFloat: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: Date;
  closedAt?: Date;
  closingFloat?: number;
}

export interface SplitPayment {
  method: PaymentMethod;
  amount: number;
}

export interface SaleRecord {
  id: string;
  folio: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  splitPayments?: SplitPayment[];
  amountPaid: number;
  changeAmount: number;
  customerName?: string;
  createdAt: Date;
  status: OrderStatus;
  orderType?: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  deliveryPhone?: string;
}

export interface TableOrder {
  tableNumber: string;
  customerName: string;
  items: CartItem[];
  status: 'OPEN' | 'CLOSED';
  createdAt: Date;
}

export interface DeliveryOrder {
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  estimatedTime?: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';
  createdAt: Date;
}

// Sistema de Multicomandas
export type ComandaStatus = 'ACTIVE' | 'IN_PROCESS' | 'CLOSED';
export type ComandaType = 'MESA' | 'LLEVAR' | 'PEDIDO' | 'BARRA';
export type ComandaPriority = 'normal' | 'high' | 'urgent';

export interface Comanda {
  id: string;
  nombre: string; // Mesa 1, Pedido 23, Llevar, etc.
  tipo: ComandaType;
  items: CartItem[];
  customerId?: string; // ID del cliente vinculado (nuevo)
  customerName?: string;
  status: ComandaStatus;
  discount: number;
  discountType: 'percentage' | 'amount';
  notes: string;
  priority: ComandaPriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComandaTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  itemCount: number;
}
