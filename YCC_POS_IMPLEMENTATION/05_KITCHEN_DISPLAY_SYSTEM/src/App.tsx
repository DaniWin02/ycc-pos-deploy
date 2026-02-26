import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KdsTicket } from './components/KdsTicket';
import { KdsStationSelector } from './components/KdsStationSelector';
import { KdsConnectionStatus } from './components/KdsConnectionStatus';
import { KdsStats } from './components/KdsStats';
import { 
  KdsTicket as KdsTicketType, 
  KdsStation, 
  KdsConnectionStatus as ConnectionStatus,
  KdsItemStatus,
  KdsTicketStatus
} from './types/kds.types';

// Estados de la aplicación KDS
type KdsAppState = 'station-select' | 'kds-view' | 'connection-error';

interface KdsAppProps {
  className?: string;
}

// Aplicación principal del KDS
export const KdsApp: React.FC<KdsAppProps> = ({ className = '' }) => {
  const [currentState, setCurrentState] = useState<KdsAppState>('station-select');
  const [selectedStation, setSelectedStation] = useState<KdsStation | null>(null);
  const [tickets, setTickets] = useState<KdsTicketType[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Estaciones de ejemplo para desarrollo
  const [stations] = useState<KdsStation[]>([
    {
      id: 'station_1',
      name: 'Cocina Principal',
      description: 'Preparación de platillos principales',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'station_2',
      name: 'Barra',
      description: 'Bebidas y cócteles',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'station_3',
      name: 'Postres',
      description: 'Preparación de postres',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  // Tickets de ejemplo para desarrollo
  const [mockTickets] = useState<KdsTicketType[]>([
    {
      id: 'ticket_1',
      orderId: 'order_1',
      order: {
        id: 'order_1',
        folio: 'ORD-001',
        customerId: 'customer_1',
        customerName: 'Juan Pérez',
        tableId: 'table_1',
        terminalId: 'terminal_1',
        storeId: 'store_1',
        createdByUserId: 'user_1',
        status: 'ACTIVE' as any,
        subtotal: 150.00,
        taxAmount: 24.00,
        discountAmount: 0,
        tipAmount: 15.00,
        totalAmount: 189.00,
        paymentStatus: 'PENDING' as any,
        notes: 'Sin cebolla',
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutos atrás
        updatedAt: new Date(),
        items: [],
        payments: []
      },
      stationId: 'station_1',
      status: 'ACTIVE' as KdsTicketStatus,
      priority: 'MEDIUM',
      items: [
        {
          id: 'item_1',
          ticketId: 'ticket_1',
          orderId: 'order_1',
          orderItemId: 'order_item_1',
          productId: 'product_1',
          productName: 'Hamburguesa Clásica',
          sku: 'COM-001',
          quantity: 2,
          unitPrice: 85.00,
          totalPrice: 170.00,
          modifiers: [
            {
              id: 'mod_1',
              name: 'Queso Extra',
              price: 10.00,
              quantity: 2
            }
          ],
          notes: 'Sin cebolla',
          status: 'PREPARING' as KdsItemStatus,
          startedAt: new Date(Date.now() - 5 * 60 * 1000),
          estimatedTime: 15,
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
          updatedAt: new Date()
        }
      ],
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      updatedAt: new Date()
    },
    {
      id: 'ticket_2',
      orderId: 'order_2',
      order: {
        id: 'order_2',
        folio: 'ORD-002',
        customerId: 'customer_2',
        customerName: 'María García',
        tableId: 'table_2',
        terminalId: 'terminal_1',
        storeId: 'store_1',
        createdByUserId: 'user_1',
        status: 'ACTIVE' as any,
        subtotal: 75.00,
        taxAmount: 12.00,
        discountAmount: 0,
        tipAmount: 8.00,
        totalAmount: 95.00,
        paymentStatus: 'PENDING' as any,
        notes: '',
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        updatedAt: new Date(),
        items: [],
        payments: []
      },
      stationId: 'station_1',
      status: 'ACTIVE' as KdsTicketStatus,
      priority: 'HIGH',
      items: [
        {
          id: 'item_2',
          ticketId: 'ticket_2',
          orderId: 'order_2',
          orderItemId: 'order_item_2',
          productId: 'product_2',
          productName: 'Papas Fritas',
          sku: 'COM-002',
          quantity: 1,
          unitPrice: 45.00,
          totalPrice: 45.00,
          modifiers: [],
          notes: '',
          status: 'PENDING' as KdsItemStatus,
          estimatedTime: 10,
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
          updatedAt: new Date()
        }
      ],
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      updatedAt: new Date()
    }
  ]);

  // Manejo de selección de estación
  const handleStationSelect = (station: KdsStation) => {
    setSelectedStation(station);
    setCurrentState('kds-view');
    
    // Simular conexión WebSocket
    setConnectionStatus(ConnectionStatus.CONNECTING);
    setTimeout(() => {
      setConnectionStatus(ConnectionStatus.CONNECTED);
      // Cargar tickets de la estación
      setTickets(mockTickets.filter(ticket => ticket.stationId === station.id));
      setLastUpdate(new Date());
    }, 2000);
  };

  // Manejo de cambios de estado de items
  const handleItemStatusChange = (ticketId: string, itemId: string, newStatus: KdsItemStatus) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? {
            ...ticket,
            items: ticket.items.map(item => 
              item.id === itemId 
                ? { 
                    ...item, 
                    status: newStatus,
                    startedAt: newStatus === 'PREPARING' ? new Date() : item.startedAt,
                    completedAt: newStatus === 'READY' ? new Date() : item.completedAt
                  }
                : item
            ),
            updatedAt: new Date()
          }
        : ticket
    ));
    
    setLastUpdate(new Date());
    
    // Simular envío de evento WebSocket
    console.log(`🔄 Evento WebSocket: kds:item-${newStatus === 'PREPARING' ? 'started' : 'ready'}`, {
      ticketId,
      itemId,
      stationId: selectedStation?.id
    });
  };

  // Manejo de cambios de estado de tickets
  const handleTicketStatusChange = (ticketId: string, newStatus: KdsTicketStatus) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: newStatus,
            completedAt: newStatus === 'COMPLETED' ? new Date() : ticket.completedAt,
            updatedAt: new Date()
          }
        : ticket
    ));
    
    setLastUpdate(new Date());
    
    // Simular envío de evento WebSocket
    console.log(`🔄 Evento WebSocket: kds:ticket-${newStatus === 'COMPLETED' ? 'ready' : 'updated'}`, {
      ticketId,
      stationId: selectedStation?.id
    });
  };

  // Renderizado del estado actual
  const renderCurrentState = () => {
    switch (currentState) {
      case 'station-select':
        return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Kitchen Display System
                </h1>
                <p className="text-gray-600">
                  Selecciona tu estación de trabajo
                </p>
              </div>
              
              <KdsStationSelector
                stations={stations}
                onStationSelect={handleStationSelect}
              />
            </motion.div>
          </div>
        );

      case 'kds-view':
        return (
          <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
              <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-white">
                      KDS - {selectedStation?.name}
                    </h1>
                    <div className="text-gray-400">
                      {selectedStation?.description}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Estadísticas */}
                    <KdsStats
                      totalTickets={tickets.length}
                      activeTickets={tickets.filter(t => t.status === 'ACTIVE').length}
                      pendingItems={tickets.reduce((sum, t) => 
                        sum + t.items.filter(i => i.status === 'PENDING').length, 0
                      )}
                    />
                    
                    {/* Estado de conexión */}
                    <KdsConnectionStatus
                      status={connectionStatus}
                      lastUpdate={lastUpdate}
                    />
                    
                    {/* Botón de cambio de estación */}
                    <button
                      onClick={() => {
                        setCurrentState('station-select');
                        setSelectedStation(null);
                        setTickets([]);
                        setConnectionStatus(ConnectionStatus.DISCONNECTED);
                      }}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cambiar Estación
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
              <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                  {connectionStatus === ConnectionStatus.CONNECTED ? (
                    <motion.div
                      key="tickets"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      {tickets.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl text-gray-600 mb-4">
                            🍽️
                          </div>
                          <div className="text-xl text-gray-400">
                            No hay tickets pendientes
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            Esperando nuevas órdenes...
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {tickets.map(ticket => (
                            <KdsTicket
                              key={ticket.id}
                              ticket={ticket}
                              onItemStatusChange={handleItemStatusChange}
                              onTicketStatusChange={handleTicketStatusChange}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="connecting"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="text-6xl text-gray-600 mb-4">
                        ⚡
                      </div>
                      <div className="text-xl text-gray-400">
                        {connectionStatus === ConnectionStatus.CONNECTING 
                          ? 'Conectando al servidor...' 
                          : 'Error de conexión'
                        }
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        {connectionStatus === ConnectionStatus.CONNECTING 
                          ? 'Estableciendo conexión WebSocket...'
                          : 'Intentando reconectar...'
                        }
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>
          </div>
        );

      case 'connection-error':
        return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center"
            >
              <div className="text-6xl text-red-600 mb-4">
                ❌
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error de Conexión
              </h2>
              <p className="text-gray-600 mb-6">
                No se pudo conectar al servidor del KDS
              </p>
              <button
                onClick={() => setCurrentState('station-select')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Reintentar
              </button>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {renderCurrentState()}
      </AnimatePresence>
    </div>
  );
};
