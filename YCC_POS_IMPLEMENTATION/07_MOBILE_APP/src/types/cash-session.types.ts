import { Customer } from './customer.types';

export enum CashSessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface CashSession {
  id: string;
  terminalId: string;
  openedByUserId: string;
  closedByUserId?: string;
  openingFloat: number;
  closingFloat?: number;
  status: CashSessionStatus;
  openedAt: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  terminal: {
    id: string;
    name: string;
    location: string;
    storeId: string;
  };
  openedByUser?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  closedByUser?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface CashSessionRequest {
  terminalId: string;
  openingFloat: number;
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

export interface CashSessionOpenRequest extends CashSessionRequest {
  customerId?: string;
}

export interface CashSessionCloseRequest {
  terminalId: string;
  closingFloat: number;
  shortageReason?: string;
}
