import React from 'react';
import { motion } from 'framer-motion';
import { KdsStation } from '../types/kds.types';

interface KdsStationSelectorProps {
  stations: KdsStation[];
  onStationSelect: (station: KdsStation) => void;
  className?: string;
}

// Componente de selección de estación del KDS
export const KdsStationSelector: React.FC<KdsStationSelectorProps> = ({ 
  stations, 
  onStationSelect,
  className = ''
}) => {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stations.map((station, index) => (
          <motion.button
            key={station.id}
            onClick={() => onStationSelect(station)}
            className={`
              bg-white border-2 rounded-lg p-6 text-left
              transition-all duration-200 transform hover:scale-105
              ${station.isActive 
                ? 'border-blue-500 hover:border-blue-600 hover:bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              delay: index * 0.1 
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">
                {getStationIcon(station.name)}
              </div>
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${station.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {station.isActive ? 'Activo' : 'Inactivo'}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {station.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {station.description}
              </p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                ID: {station.id}
              </div>
              <div className="text-blue-600 font-medium">
                Seleccionar →
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      
      {stations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-400 mb-4">
            🍽️
          </div>
          <div className="text-xl text-gray-600">
            No hay estaciones disponibles
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Contacta al administrador del sistema
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function para obtener icono según nombre de estación
const getStationIcon = (stationName: string): string => {
  const name = stationName.toLowerCase();
  
  if (name.includes('cocina') || name.includes('kitchen')) {
    return '👨‍🍳';
  } else if (name.includes('barra') || name.includes('bar')) {
    return '🍹';
  } else if (name.includes('postre') || name.includes('dessert')) {
    return '🍰';
  } else if (name.includes('parrilla') || name.includes('grill')) {
    return '🍖';
  } else if (name.includes('ensalada') || name.includes('salad')) {
    return '🥗';
  } else if (name.includes('pizza')) {
    return '🍕';
  } else if (name.includes('sushi')) {
    return '🍱';
  } else if (name.includes('bebida') || name.includes('drink')) {
    return '🥤';
  } else {
    return '🍽️';
  }
};
