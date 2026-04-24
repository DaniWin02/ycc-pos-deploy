// Type definitions for API responses and complex objects

export interface CashSessionResponse {
  id: string;
  terminalId: string;
  openedByUserId: string;
  closedByUserId?: string;
  shiftId?: string;
  openingFloat: number;
  closingFloat?: number;
  expectedFloat?: number;
  countedCash?: number;
  difference?: number;
  totalSales?: number;
  totalCash?: number;
  totalCard?: number;
  totalMemberAccount?: number;
  transactionCount?: number;
  notes?: string;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  openedAt: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftResponse {
  id: string;
  storeId: string;
  terminalId?: string;
  startedByUserId: string;
  endedByUserId?: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashCutReport {
  sessionId: string;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalMemberAccount: number;
  transactionCount: number;
  expectedFloat: number;
  countedCash: number;
  difference: number;
  closedAt: string;
  closedBy: string;
}

export interface SaleResponse {
  id: string;
  folio: string;
  items: SaleItemResponse[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  splitPayments?: SplitPaymentResponse[];
  amountPaid: number;
  changeAmount: number;
  customerName?: string;
  status: string;
  orderType?: string;
  tableNumber?: string;
  deliveryAddress?: string;
  deliveryPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SplitPaymentResponse {
  method: string;
  amount: number;
}

export interface ProductResponse {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  imageUrl?: string;
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

export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
}
