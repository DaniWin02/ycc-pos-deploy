import React from 'react';
import { motion } from 'framer-motion';

interface KdsStatsProps {
  totalTickets: number;
  activeTickets: number;
  pendingItems: number;
  className?: string;
}

// Componente de estadísticas del KDS
export const KdsStats: React.FC<KdsStatsProps> = ({ 
  totalTickets, 
  activeTickets, 
  pendingItems,
  className = ''
}) => {
  const stats = [
    {
      label: 'Tickets',
      value: totalTickets,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900',
      icon: '📋'
    },
    {
      label: 'Activos',
      value: activeTickets,
      color: 'text-green-400',
      bgColor: 'bg-green-900',
      icon: '🔥'
    },
    {
      label: 'Pendientes',
      value: pendingItems,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900',
      icon: '⏳'
    }
  ];

  return (
    <div className={`flex gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className={`
            ${stat.bgColor} rounded-lg p-3 border border-gray-700
            transition-all duration-200 hover:border-gray-600
          `}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30,
            delay: index * 0.1 
          }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {stat.icon}
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-400">
                {stat.label}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
