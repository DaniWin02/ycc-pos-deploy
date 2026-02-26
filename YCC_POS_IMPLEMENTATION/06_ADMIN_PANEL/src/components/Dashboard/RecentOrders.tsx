import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { RecentOrder } from '../../types/admin.types';

interface RecentOrdersProps {
  orders: RecentOrder[];
  loading?: boolean;
  className?: string;
}

// Componente de órdenes recientes para el Dashboard
export const RecentOrders: React.FC<RecentOrdersProps> = ({
  orders,
  loading = false,
  className = ''
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'ACTIVE':
      case 'PREPARING':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50';
      case 'ACTIVE':
        return 'text-blue-600 bg-blue-50';
      case 'PREPARING':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'ACTIVE':
        return 'Activa';
      case 'PREPARING':
        return 'Preparando';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-6
        ${className}
      `}>
        <div className="animate-pulse">
          <div className="w-48 h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div>
                    <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="w-20 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-20 h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-6
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Órdenes Recientes
            </h3>
            <p className="text-sm text-gray-600">
              Últimas 10 órdenes
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">+12%</span>
            <span className="text-gray-600">vs ayer</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              delay: index * 0.05 
            }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-3">
              {/* Folio */}
              <div className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                #{order.folio}
              </div>

              {/* Información del cliente */}
              <div>
                <div className="font-medium text-gray-900">
                  {order.customerName || 'Cliente General'}
                </div>
                <div className="text-sm text-gray-600">
                  Terminal {order.terminalId} • {formatTime(order.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Estado */}
              <div className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${getStatusColor(order.status)}
              `}>
                {getStatusIcon(order.status)}
                <span>{getStatusText(order.status)}</span>
              </div>

              {/* Monto */}
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl text-gray-400 mb-2">
            📋
          </div>
          <div className="text-gray-600">
            No hay órdenes recientes
          </div>
          <div className="text-sm text-gray-500 mt-1">
            No se registraron órdenes en las últimas horas
          </div>
        </div>
      )}

      {/* Ver más */}
      {orders.length > 0 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
            Ver todas las órdenes →
          </button>
        </div>
      )}
    </motion.div>
  );
};
