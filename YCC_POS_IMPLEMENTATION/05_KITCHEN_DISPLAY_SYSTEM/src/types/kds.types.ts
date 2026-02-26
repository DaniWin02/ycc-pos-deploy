import { Order, OrderItem } from '@ycc/types';

export enum KdsTicketStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum KdsItemStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum KdsConnectionStatus {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING'
}

export interface KdsStation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface KdsTicketItem {
  id: string;
  ticketId: string;
  orderId: string;
  orderItemId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  notes?: string;
  status: KdsItemStatus;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTime?: number; // minutos estimados
  actualTime?: number; // minutos reales
  createdAt: Date;
  updatedAt: Date;
}

export interface KdsTicket {
  id: string;
  orderId: string;
  order: Order;
  stationId: string;
  status: KdsTicketStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  items: KdsTicketItem[];
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface KdsState {
  station: KdsStation | null;
  tickets: KdsTicket[];
  connectionStatus: KdsConnectionStatus;
  isConnected: boolean;
  lastUpdate: Date | null;
  selectedTicketId: string | null;
  filters: {
    status?: KdsTicketStatus;
    priority?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}

export interface KdsWebSocketMessage {
  type: 'order:new' | 'order:modified' | 'order:cancelled' | 'kds:item-started' | 'kds:item-ready' | 'kds:ticket-ready' | 'kds:station-connected' | 'kds:station-disconnected' | 'kds:reconnecting';
  data: any;
  timestamp: Date;
  stationId?: string;
  ticketId?: string;
  itemId?: string;
}

export interface KdsTimerConfig {
  warningTime: number; // minutos para advertencia (amarillo)
  urgentTime: number; // minutos para urgente (rojo)
  criticalTime: number; // minutos para crítico (pulso)
}

export interface KdsNotification {
  id: string;
  type: 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS' | 'ERROR';
  title: string;
  message: string;
  ticketId?: string;
  itemId?: string;
  autoHide?: boolean;
  duration?: number; // milisegundos
  sound?: string;
  createdAt: Date;
}

export interface KdsStats {
  totalTickets: number;
  pendingTickets: number;
  activeTickets: number;
  completedTickets: number;
  averagePreparationTime: number;
  overdueItems: number;
  stationEfficiency: number;
}

// Tipos para eventos del KDS
export type KdsEventType = 
  | 'TICKET_RECEIVED'
  | 'ITEM_STARTED'
  | 'ITEM_READY'
  | 'TICKET_COMPLETED'
  | 'STATION_CONNECTED'
  | 'STATION_DISCONNECTED'
  | 'CONNECTION_ERROR'
  | 'TIMER_WARNING'
  | 'TIMER_URGENT';

export interface KdsEvent {
  type: KdsEventType;
  ticketId?: string;
  itemId?: string;
  stationId?: string;
  data?: any;
  timestamp: Date;
}

// Helper functions para crear rooms de WebSocket
export const createKdsRoom = (stationId: string): string => `kds:${stationId}`;
export const createTicketRoom = (ticketId: string): string => `ticket:${ticketId}`;
export const createItemRoom = (itemId: string): string => `item:${itemId}`;

// Helper functions para tiempo
export const getElapsedTime = (startTime: Date): number => {
  return Math.floor((Date.now() - startTime.getTime()) / 1000 / 60); // minutos
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const getTimeColor = (minutes: number, config: KdsTimerConfig): string => {
  if (minutes >= config.criticalTime) return 'text-red-600 bg-red-100';
  if (minutes >= config.urgentTime) return 'text-orange-600 bg-orange-100';
  if (minutes >= config.warningTime) return 'text-yellow-600 bg-yellow-100';
  return 'text-green-600 bg-green-100';
};

export const getStatusColor = (status: KdsItemStatus): string => {
  switch (status) {
    case KdsItemStatus.PENDING:
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case KdsItemStatus.CONFIRMED:
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case KdsItemStatus.PREPARING:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case KdsItemStatus.READY:
      return 'bg-green-100 text-green-800 border-green-300';
    case KdsItemStatus.COMPLETED:
      return 'bg-gray-100 text-gray-600 border-gray-300';
    case KdsItemStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-500 text-white';
    case 'HIGH':
      return 'bg-orange-500 text-white';
    case 'MEDIUM':
      return 'bg-yellow-500 text-white';
    case 'LOW':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};
