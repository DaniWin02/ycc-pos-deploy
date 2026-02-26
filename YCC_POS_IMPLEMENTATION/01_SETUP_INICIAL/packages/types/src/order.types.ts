import { BaseEntity } from './index';

// Tipos de órdenes para el sistema YCC POS

export interface Order {
  id: string;
  folio: string;
  customerId?: string;
  customerName?: string;
  tableId?: string;
  terminalId: string;
  storeId: string;
  createdByUserId: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  modifiers: OrderModifier[];
  notes?: string;
  status: OrderItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderModifier {
  id: string;
  orderItemId: string;
  modifierId: string;
  modifierName: string;
  modifierType: ModifierType;
  price: number;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  authorizationCode?: string;
  status: PaymentStatus;
  capturedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Enums del sistema
export enum OrderStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum OrderItemStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  CAPTURED = 'CAPTURED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MEMBER_ACCOUNT = 'MEMBER_ACCOUNT',
  MIXED = 'MIXED'
}

export enum ModifierType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
  REPLACE = 'REPLACE'
}

// Tipos para creación de órdenes
export interface CreateOrderRequest {
  customerId?: string;
  tableId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    modifiers?: Array<{
      modifierId: string;
      quantity: number;
    }>;
  }>;
  notes?: string;
}

export interface CreateOrderResponse {
  order: Order;
  message: string;
  success: boolean;
}

// Tipos para filtros y búsqueda
export interface OrderFilters {
  status?: OrderStatus;
  customerId?: string;
  storeId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  folio?: string;
  paymentMethod?: PaymentMethod;
}

// Estadísticas de órdenes
export interface OrderStats {
  totalOrders: number;
  totalAmount: number;
  averageTicket: number;
  itemsPerOrder: number;
  paymentMethodBreakdown: Record<PaymentMethod, number>;
  statusBreakdown: Record<OrderStatus, number>;
}
