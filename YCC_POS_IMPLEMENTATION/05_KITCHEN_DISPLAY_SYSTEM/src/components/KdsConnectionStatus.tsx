import React from 'react';
import { motion } from 'framer-motion';
import { KdsConnectionStatus } from '../types/kds.types';

interface KdsConnectionStatusProps {
  status: KdsConnectionStatus;
  lastUpdate: Date | null;
  className?: string;
}

// Componente de estado de conexión del KDS
export const KdsConnectionStatus: React.FC<KdsConnectionStatusProps> = ({ 
  status, 
  lastUpdate,
  className = ''
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case KdsConnectionStatus.CONNECTED:
        return {
          text: 'Conectado',
          color: 'text-green-600 bg-green-100',
          icon: '🟢',
          description: 'Conexión estable'
        };
      case KdsConnectionStatus.CONNECTING:
        return {
          text: 'Conectando',
          color: 'text-yellow-600 bg-yellow-100',
          icon: '🟡',
          description: 'Estableciendo conexión...'
        };
      case KdsConnectionStatus.DISCONNECTED:
        return {
          text: 'Desconectado',
          color: 'text-red-600 bg-red-100',
          icon: '🔴',
          description: 'Sin conexión'
        };
      case KdsConnectionStatus.RECONNECTING:
        return {
          text: 'Reconectando',
          color: 'text-orange-600 bg-orange-100',
          icon: '🟠',
          description: 'Intentando reconectar...'
        };
      default:
        return {
          text: 'Desconocido',
          color: 'text-gray-600 bg-gray-100',
          icon: '⚪',
          description: 'Estado desconocido'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const isConnecting = status === KdsConnectionStatus.CONNECTING || status === KdsConnectionStatus.RECONNECTING;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Icono de estado */}
        <motion.div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-lg
            ${statusInfo.color}
          `}
          initial={{ scale: 1 }}
          animate={isConnecting ? { scale: [1, 1.2, 1] } : {}}
          transition={{ 
            repeat: isConnecting ? Infinity : 0, 
            duration: 1.5,
            ease: "easeInOut"
          }}
        >
          {statusInfo.icon}
        </motion.div>
        
        {/* Indicador de pulso para conexión */}
        {isConnecting && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-current opacity-50"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
      
      <div className="text-right">
        <div className="text-sm font-medium text-white">
          {statusInfo.text}
        </div>
        <div className="text-xs text-gray-400">
          {statusInfo.description}
        </div>
        {lastUpdate && (
          <div className="text-xs text-gray-500 mt-1">
            Última actualización: {formatTime(lastUpdate)}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function para formatear tiempo
const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    return 'Ahora';
  } else if (diffMins < 60) {
    return `Hace ${diffMins} min`;
  } else {
    const hours = Math.floor(diffMins / 60);
    return `Hace ${hours}h`;
  }
};
