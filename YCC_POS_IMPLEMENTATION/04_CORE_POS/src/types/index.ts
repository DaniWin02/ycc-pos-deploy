// Tipos autocontenidos para el Core POS del YCC

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MEMBER_ACCOUNT' | 'TRANSFER';
export type OrderStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PREPARING' | 'READY';
export type POSMode = 'COUNTER' | 'TABLE' | 'DELIVERY';
export type OrderType = 'COUNTER' | 'TABLE' | 'DELIVERY' | 'TAKEOUT';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  price: number;
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

export interface Comanda {
  id: string;
  nombre: string; // Mesa 1, Pedido 23, Llevar, etc.
  tipo: ComandaType;
  items: CartItem[];
  customerName?: string;
  status: ComandaStatus;
  discount: number;
  discountType: 'percentage' | 'amount';
  notes: string;
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
