import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KdsItemStatus } from '../types/kds.types';
import { getElapsedTime, formatTime, getTimeColor } from '../types/kds.types';

interface KdsTimerProps {
  startTime: Date;
  status: KdsItemStatus;
  estimatedTime?: number;
  className?: string;
}

// Componente de temporizador para items del KDS
export const KdsTimer: React.FC<KdsTimerProps> = ({ 
  startTime, 
  status, 
  estimatedTime = 15,
  className = ''
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = getElapsedTime(startTime);
      setElapsedTime(elapsed);
      
      // Verificar si es urgente
      const urgent = elapsed >= estimatedTime;
      if (urgent !== isUrgent) {
        setIsUrgent(urgent);
      }
    }, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, [startTime, estimatedTime]);

  const timerConfig = {
    warningTime: Math.floor(estimatedTime * 0.6),
    urgentTime: Math.floor(estimatedTime * 0.8),
    criticalTime: estimatedTime
  };

  const timerColor = getTimeColor(elapsedTime, timerConfig);
  const isCompleted = status === KdsItemStatus.COMPLETED;

  if (isCompleted) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-sm text-gray-500">
          Completado
        </div>
        <div className="text-xs text-gray-400">
          {formatTime(getElapsedTime(startTime))}
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      {/* Temporizador principal */}
      <motion.div
        className={`
          text-3xl font-bold font-mono p-3 rounded-lg
          ${timerColor}
          ${isUrgent ? 'animate-pulse' : ''}
        `}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {formatTime(elapsedTime)}
      </motion.div>

      {/* Indicador de estado */}
      <div className="mt-2">
        <StatusIndicator status={status} />
      </div>

      {/* Barra de progreso visual */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`
            h-2 rounded-full transition-all duration-300
            ${getProgressBarColor(elapsedTime, estimatedTime)}
          `}
          initial={{ width: 0 }}
          animate={{ 
            width: `${Math.min((elapsedTime / estimatedTime) * 100, 100)}%` 
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Texto de tiempo restante */}
      {elapsedTime < estimatedTime && (
        <div className="mt-2 text-sm text-gray-600">
          Tiempo restante: {estimatedTime - elapsedTime} min
        </div>
      )}

      {/* Alerta de sobretiempo */}
      {elapsedTime > estimatedTime && (
        <motion.div
          className="mt-2 text-sm font-medium text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          ⚠️ {elapsedTime - estimatedTime} min sobretiempo
        </motion.div>
      )}
    </div>
  );
};

// Componente de indicador de estado
interface StatusIndicatorProps {
  status: KdsItemStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case KdsItemStatus.PENDING:
        return { text: 'Pendiente', color: 'text-gray-600 bg-gray-100' };
      case KdsItemStatus.CONFIRMED:
        return { text: 'Confirmado', color: 'text-blue-600 bg-blue-100' };
      case KdsItemStatus.PREPARING:
        return { text: 'Preparando', color: 'text-yellow-600 bg-yellow-100' };
      case KdsItemStatus.READY:
        return { text: 'Listo', color: 'text-green-600 bg-green-100' };
      case KdsItemStatus.COMPLETED:
        return { text: 'Completado', color: 'text-gray-500 bg-gray-100' };
      case KdsItemStatus.CANCELLED:
        return { text: 'Cancelado', color: 'text-red-600 bg-red-100' };
      default:
        return { text: 'Desconocido', color: 'text-gray-600 bg-gray-100' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`
      px-3 py-1 rounded-full text-xs font-medium
      ${statusInfo.color}
    `}>
      {statusInfo.text}
    </div>
  );
};

// Helper function para color de barra de progreso
const getProgressBarColor = (elapsed: number, estimated: number): string => {
  const percentage = (elapsed / estimated) * 100;
  
  if (percentage >= 100) return 'bg-red-600';
  if (percentage >= 80) return 'bg-orange-500';
  if (percentage >= 60) return 'bg-yellow-500';
  return 'bg-green-500';
};
