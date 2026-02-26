// Tipos autocontenidos para el Core POS del YCC

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MEMBER_ACCOUNT' | 'TRANSFER';
export type OrderStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PREPARING' | 'READY';

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
}

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  categoryName: string;
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

export interface SaleRecord {
  id: string;
  folio: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeAmount: number;
  customerName?: string;
  createdAt: Date;
  status: OrderStatus;
}
