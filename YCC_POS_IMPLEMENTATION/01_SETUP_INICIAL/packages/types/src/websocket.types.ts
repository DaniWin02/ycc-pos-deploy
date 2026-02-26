// Tipos para WebSocket del sistema YCC POS

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  roomId?: string;
  id: string;
}

export interface WebSocketConnection {
  id: string;
  url: string;
  status: WebSocketStatus;
  lastPing?: Date;
  reconnectAttempts: number;
}

export enum WebSocketStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// Eventos de WebSocket para todo el sistema
export interface BaseWebSocketEvent {
  type: string;
  timestamp: Date;
  storeId: string;
}

// Eventos de órdenes (POS → KDS)
export interface OrderNewEvent extends BaseWebSocketEvent {
  type: 'order:new';
  payload: {
    orderId: string;
    folio: string;
    customerName?: string;
    items: Array<{
      id: string;
      productId: string;
      name: string;
      quantity: number;
      modifiers: string[];
    }>;
    totalAmount: number;
    stationId?: string;
  };
}

export interface OrderModifiedEvent extends BaseWebSocketEvent {
  type: 'order:modified';
  payload: {
    orderId: string;
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
  };
}

export interface OrderCancelledEvent extends BaseWebSocketEvent {
  type: 'order:cancelled';
  payload: {
    orderId: string;
    reason: string;
    timestamp: Date;
  };
}

// Eventos del KDS (KDS → POS)
export interface KdsItemStartedEvent extends BaseWebSocketEvent {
  type: 'kds:item-started';
  payload: {
    ticketId: string;
    itemId: string;
    stationId: string;
    timestamp: Date;
  };
}

export interface KdsItemReadyEvent extends BaseWebSocketEvent {
  type: 'kds:item-ready';
  payload: {
    ticketId: string;
    itemId: string;
    stationId: string;
    timestamp: Date;
  };
}

export interface KdsTicketReadyEvent extends BaseWebSocketEvent {
  type: 'kds:ticket-ready';
  payload: {
    ticketId: string;
    orderId: string;
    stationId: string;
    timestamp: Date;
  };
}

// Tipos de rooms para WebSocket
export interface WebSocketRoom {
  storeId: string;
  module: 'pos' | 'kds' | 'admin';
  stationId?: string;
}

// Helper para crear rooms
export const createWebSocketRoom = (
  storeId: string,
  module: 'pos' | 'kds' | 'admin',
  stationId?: string
): string => {
  const base = `store:${storeId}:${module}`;
  return stationId ? `${base}:${stationId}` : base;
};

// Union de todos los eventos del sistema
export type SystemWebSocketEvent = 
  | OrderNewEvent
  | OrderModifiedEvent
  | OrderCancelledEvent
  | KdsItemStartedEvent
  | KdsItemReadyEvent
  | KdsTicketReadyEvent;
