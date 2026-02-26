import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  className?: string;
}

// Componente de tarjeta de estadísticas para el Dashboard
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  loading = false,
  className = ''
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-900',
          trendPositive: 'text-green-600',
          trendNegative: 'text-red-600'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          textColor: 'text-green-900',
          trendPositive: 'text-green-600',
          trendNegative: 'text-red-600'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-900',
          trendPositive: 'text-green-600',
          trendNegative: 'text-red-600'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          textColor: 'text-red-900',
          trendPositive: 'text-green-600',
          trendNegative: 'text-red-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          textColor: 'text-purple-900',
          trendPositive: 'text-green-600',
          trendNegative: 'text-red-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          textColor: 'text-gray-900',
          trendPositive: 'text-green-600',
          trendNegative: 'text-red-600'
        };
    }
  };

  const colors = getColorClasses();

  if (loading) {
    return (
      <div className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-6
        ${className}
      `}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`
        ${colors.bg} rounded-lg shadow-sm border border-gray-200 p-6
        transition-all duration-200 hover:shadow-md hover:scale-[1.02]
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`
          ${colors.iconBg} p-3 rounded-lg
        `}>
          <Icon className={`w-6 h-6 ${colors.iconColor}`} />
        </div>
        
        {trend && (
          <div className="flex items-center gap-1">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`
                flex items-center gap-1 text-sm font-medium
                ${trend.isPositive ? colors.trendPositive : colors.trendNegative}
              `}
            >
              {trend.isPositive ? '↑' : '↓'}
              {Math.abs(trend.value)}%
            </motion.div>
          </div>
        )}
      </div>
      
      <div>
        <div className={`text-2xl font-bold ${colors.textColor} mb-1`}>
          {typeof value === 'number' 
            ? new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
              }).format(value)
            : value
          }
        </div>
        <div className="text-sm text-gray-600">
          {title}
        </div>
      </div>
    </motion.div>
  );
};
