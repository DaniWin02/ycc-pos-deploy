import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KdsTicket, KdsTicketItem, KdsTicketStatus, KdsItemStatus } from '../types/kds.types';
import { KdsTimer } from './KdsTimer';
import { KdsTicketItem } from './KdsTicketItem';
import { getStatusColor, getPriorityColor, formatTime } from '../types/kds.types';

interface KdsTicketProps {
  ticket: KdsTicket;
  onItemStatusChange: (ticketId: string, itemId: string, newStatus: KdsItemStatus) => void;
  onTicketStatusChange: (ticketId: string, newStatus: KdsTicketStatus) => void;
  className?: string;
}

// Componente principal de ticket del KDS
export const KdsTicket: React.FC<KdsTicketProps> = ({ 
  ticket, 
  onItemStatusChange, 
  onTicketStatusChange,
  className = ''
}) => {
  const handleItemClick = (itemId: string, currentStatus: KdsItemStatus) => {
    let newStatus: KdsItemStatus;
    
    switch (currentStatus) {
      case KdsItemStatus.PENDING:
        newStatus = KdsItemStatus.CONFIRMED;
        break;
      case KdsItemStatus.CONFIRMED:
        newStatus = KdsItemStatus.PREPARING;
        break;
      case KdsItemStatus.PREPARING:
        newStatus = KdsItemStatus.READY;
        break;
      case KdsItemStatus.READY:
        newStatus = KdsItemStatus.COMPLETED;
        break;
      default:
        return;
    }
    
    onItemStatusChange(ticket.id, itemId, newStatus);
  };

  const handleTicketComplete = () => {
    if (ticket.items.every(item => item.status === KdsItemStatus.READY)) {
      onTicketStatusChange(ticket.id, KdsTicketStatus.COMPLETED);
    }
  };

  const isCompleted = ticket.status === KdsTicketStatus.COMPLETED;
  const allItemsReady = ticket.items.every(item => item.status === KdsItemStatus.READY);

  return (
    <AnimatePresence>
      {!isCompleted && (
        <motion.div
          className={`
            bg-white rounded-lg shadow-lg border-2 mb-4 overflow-hidden
            ${getStatusColor(ticket.status as KdsItemStatus)}
            ${className}
          `}
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          layout
        >
          {/* Header del ticket */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </div>
                  <div>
                    <div className="font-bold text-lg">
                      Orden #{ticket.order.folio}
                    </div>
                    <div className="text-sm text-gray-600">
                      {ticket.order.customerName && `Cliente: ${ticket.order.customerName}`}
                    </div>
                    {ticket.order.tableId && (
                      <div className="text-sm text-gray-600">
                        Mesa: {ticket.order.tableId}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {formatTime(Math.floor((Date.now() - ticket.createdAt.getTime()) / 1000 / 60))}
                  </div>
                  <div className="text-lg font-bold">
                    ${new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN'
                    }).format(ticket.order.totalAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items del ticket */}
          <div className="p-4 space-y-3">
            {ticket.items.map((item, index) => (
              <KdsTicketItem
                key={item.id}
                item={item}
                onItemClick={() => handleItemClick(item.id, item.status)}
              />
            ))}
          </div>

          {/* Footer del ticket */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {ticket.items.length} item{ticket.items.length === 1 ? '' : 's'}
              </div>
              
              {allItemsReady && (
                <motion.button
                  onClick={handleTicketComplete}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Completar Ticket
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
