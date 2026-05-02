import { Cart } from './cart.types';

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

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MEMBER_ACCOUNT = 'MEMBER_ACCOUNT',
  MIXED = 'MIXED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  CAPTURED = 'CAPTURED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED'
}

export interface OrderModifier {
  modifierId: string;
  modifierName: string;
  quantity: number;
  priceAdd?: number;
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
  items: OrderItem[];
  payments: Payment[];
  customer?: {
    id: string;
    name: string;
    memberNumber?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface OrderCreateRequest {
  customerId?: string;
  tableId?: string;
  terminalId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    modifiers?: Array<{
      modifierId: string;
      quantity: number;
    }>;
  }>;
  notes?: string;
  discountAmount?: number;
  tipAmount?: number;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  notes?: string;
  discountAmount?: number;
  tipAmount?: number;
}

export interface OrderSearchFilters {
  status?: OrderStatus;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  folio?: string;
  paymentMethod?: PaymentMethod;
  storeId?: string;
  terminalId?: string;
}

export interface OrderSearchResult {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
