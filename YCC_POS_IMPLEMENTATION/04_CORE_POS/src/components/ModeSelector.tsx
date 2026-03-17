import React from 'react';
import { motion } from 'framer-motion';
import { Store, Utensils, Truck } from 'lucide-react';
import { POSMode } from '../types';

interface ModeSelectorProps {
  currentMode: POSMode;
  onModeChange: (mode: POSMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    {
      id: 'COUNTER' as POSMode,
      label: 'Mostrador',
      icon: Store,
      description: 'Ventas rápidas en caja',
      color: 'emerald'
    },
    {
      id: 'TABLE' as POSMode,
      label: 'Mesa',
      icon: Utensils,
      description: 'Servicio de mesa',
      color: 'blue'
    },
    {
      id: 'DELIVERY' as POSMode,
      label: 'Domicilio',
      icon: Truck,
      description: 'Pedidos a domicilio',
      color: 'purple'
    }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Selecciona el modo de operación</h1>
          <p className="text-gray-400">Elige cómo deseas tomar pedidos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modes.map((mode, index) => {
            const Icon = mode.icon;
            const isSelected = currentMode === mode.id;
            
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onModeChange(mode.id)}
                className={`
                  relative p-8 rounded-2xl border-2 transition-all duration-300
                  ${isSelected 
                    ? `bg-${mode.color}-600 border-${mode.color}-400 shadow-2xl shadow-${mode.color}-500/50` 
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                  }
                `}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`
                    w-20 h-20 rounded-full flex items-center justify-center
                    ${isSelected 
                      ? 'bg-white/20' 
                      : 'bg-gray-700'
                    }
                  `}>
                    <Icon className={`w-10 h-10 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  
                  <div>
                    <h3 className={`text-2xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                      {mode.label}
                    </h3>
                    <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {mode.description}
                    </p>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center"
                    >
                      <svg className={`w-5 h-5 text-${mode.color}-600`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            Puedes cambiar el modo en cualquier momento desde el menú principal
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
