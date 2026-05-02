import type { Payment } from './order.types';
export { PaymentMethod, PaymentStatus } from './order.types';
import type { PaymentMethod } from './order.types';

export interface PaymentRequest {
  method: PaymentMethod;
  amount: number;
  memberNumber?: string;
  reference?: string;
  authorizationCode?: string;
  customerPaymentMethod?: string;
  customerPaymentData?: {
    cardNumber: string;
    cardHolderName: string;
    expiryDate: string;
    cvv?: string;
    memberNumber?: string;
  };
}

export interface PaymentResponse {
  payment: Payment;
  message: string;
  success: boolean;
  changeAmount?: number;
}

export interface RefundRequest {
  paymentId: string;
  reason: string;
  amount?: number;
}

export interface RefundResponse {
  refund: Payment;
  message: string;
  success: boolean;
}

export interface CashSessionRequest {
  terminalId: string;
  openingFloat: number;
}

export interface CashSessionResponse {
  cashSession: {
    id: string;
    terminalId: string;
    openedByUserId: string;
    openingFloat: number;
    status: 'OPEN' | 'CLOSED';
    openedAt: Date;
    closedAt?: Date;
    closingFloat?: number;
    closedByUserId?: string;
  };
  message: string;
  success: boolean;
}

export interface CashSessionSummary {
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalMemberAccount: number;
  totalOther: number;
  expectedCash: number;
  actualCash: number;
  overage: number;
  shortage: number;
}

export interface CashSessionSummaryRequest {
  terminalId: string;
  dateFrom?: Date;
  dateTo?: Date;
}
