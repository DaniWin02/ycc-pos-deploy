import { BaseEntity } from './index';

export interface KdsStation {
  id: string;
  name: string;
  isActive: boolean;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KdsTicketItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  modifiers: string[];
  status: KdsItemStatus;
  stationId: string;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface KdsTicket {
  id: string;
  orderId: string;
  folio: string;
  customerName?: string;
  tableName?: string;
  items: KdsTicketItem[];
  status: KdsTicketStatus;
  createdAt: Date;
  stationId: string;
  storeId: string;
}

export enum KdsTicketStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum KdsItemStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Tipos para el estado del KDS
export interface KdsState {
  tickets: KdsTicket[];
  stationId: string;
  storeId: string;
  connectionStatus: KdsConnectionStatus;
  pendingCount: number;
  inProgressCount: number;
  readyCount: number;
}

export enum KdsConnectionStatus {
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

// Eventos específicos del KDS
export interface KdsItemStartedEvent {
  ticketId: string;
  itemId: string;
  stationId: string;
  timestamp: Date;
}

export interface KdsItemReadyEvent {
  ticketId: string;
  itemId: string;
  stationId: string;
  timestamp: Date;
}

export interface KdsTicketReadyEvent {
  ticketId: string;
  orderId: string;
  stationId: string;
  timestamp: Date;
}
