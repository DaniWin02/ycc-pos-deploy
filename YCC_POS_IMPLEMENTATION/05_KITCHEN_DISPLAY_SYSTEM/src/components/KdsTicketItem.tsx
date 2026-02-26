import React from 'react';
import { motion } from 'framer-motion';
import { KdsTicketItem, KdsItemStatus } from '../types/kds.types';
import { KdsTimer } from './KdsTimer';
import { getStatusColor, formatTime } from '../types/kds.types';

interface KdsTicketItemProps {
  item: KdsTicketItem;
  onItemClick: () => void;
  className?: string;
}

// Componente individual de item del ticket KDS
export const KdsTicketItem: React.FC<KdsTicketItemProps> = ({ 
  item, 
  onItemClick,
  className = ''
}) => {
  const isCompleted = item.status === KdsItemStatus.COMPLETED;
  const isReady = item.status === KdsItemStatus.READY;
  const isPreparing = item.status === KdsItemStatus.PREPARING;
  const isPending = item.status === KdsItemStatus.PENDING;

  return (
    <motion.div
      className={`
        bg-white rounded-lg border-2 p-4 cursor-pointer transition-all duration-200
        ${getStatusColor(item.status)}
        ${isCompleted ? 'opacity-60' : 'hover:shadow-lg'}
        ${className}
      `}
      onClick={isCompleted ? undefined : onItemClick}
      whileHover={!isCompleted ? { scale: 1.02 } : {}}
      whileTap={!isCompleted ? { scale: 0.98 } : {}}
      layout
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="font-semibold text-lg">
              {item.quantity}x {item.productName}
            </div>
            {item.modifiers.length > 0 && (
              <div className="text-sm text-gray-600">
                +{item.modifiers.length} mods
              </div>
            )}
          </div>
          
          {item.notes && (
            <div className="text-sm text-gray-600 italic">
              Nota: {item.notes}
            </div>
          )}
          
          {item.modifiers.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.modifiers.map((mod, index) => (
                <div key={index} className="text-sm text-gray-600">
                  + {mod.quantity}x {mod.name} 
                  {mod.price > 0 && ` (+$${mod.price.toFixed(2)})`}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold">
            ${new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(item.totalPrice)}
          </div>
          
          {/* Temporizador */}
          {!isCompleted && (
            <div className="mt-2">
              <KdsTimer
                startTime={item.createdAt}
                status={item.status}
                estimatedTime={item.estimatedTime}
              />
            </div>
          )}
          
          {/* Estado del item */}
          <div className="mt-2">
            <div className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${getStatusColor(item.status)}
            `}>
              {getStatusText(item.status)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicador de urgencia para items tardíos */}
      {!isCompleted && item.startedAt && (
        <div className="mt-3">
          <UrgencyIndicator 
            startTime={item.startedAt}
            estimatedTime={item.estimatedTime}
          />
        </div>
      )}
    </motion.div>
  );
};

// Helper function para obtener texto del estado
const getStatusText = (status: KdsItemStatus): string => {
  switch (status) {
    case KdsItemStatus.PENDING:
      return 'Pendiente';
    case KdsItemStatus.CONFIRMED:
      return 'Confirmado';
    case KdsItemStatus.PREPARING:
      return 'Preparando';
    case KdsItemStatus.READY:
      return 'Listo';
    case KdsItemStatus.COMPLETED:
      return 'Completado';
    case KdsItemStatus.CANCELLED:
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};

// Componente de indicador de urgencia
interface UrgencyIndicatorProps {
  startTime: Date;
  estimatedTime?: number;
}

const UrgencyIndicator: React.FC<UrgencyIndicatorProps> = ({ 
  startTime, 
  estimatedTime = 15 
}) => {
  const elapsedMinutes = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60);
  const isUrgent = elapsedMinutes > estimatedTime;
  
  if (!isUrgent) return null;
  
  return (
    <motion.div
      className="flex items-center gap-2 text-red-600"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <motion.div
        className="w-3 h-3 bg-red-600 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ 
          repeat: Infinity, 
          duration: 1,
          ease: "easeInOut"
        }}
      />
      <span className="text-sm font-medium">
        ¡URGENTE!
      </span>
    </motion.div>
  );
};
