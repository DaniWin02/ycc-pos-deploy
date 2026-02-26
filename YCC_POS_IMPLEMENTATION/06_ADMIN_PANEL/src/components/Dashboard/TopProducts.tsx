import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TopProduct } from '../../types/admin.types';

interface TopProductsProps {
  products: TopProduct[];
  loading?: boolean;
  className?: string;
}

// Componente de productos más vendidos para el Dashboard
export const TopProducts: React.FC<TopProductsProps> = ({
  products,
  loading = false,
  className = ''
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const getTrendIcon = (index: number) => {
    if (index === 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (index === 1) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getTrendColor = (index: number) => {
    if (index === 0) return 'text-green-600 bg-green-50';
    if (index === 1) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
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
        <h3 className="text-lg font-semibold text-gray-900">
          Productos Más Vendidos
        </h3>
        <p className="text-sm text-gray-600">
          Top 5 productos del período
        </p>
      </div>

      <div className="space-y-3">
        {products.map((product, index) => (
          <motion.div
            key={product.productId}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              delay: index * 0.1 
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              {/* Posición */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }
              `}>
                {index + 1}
              </div>

              {/* Información del producto */}
              <div>
                <div className="font-medium text-gray-900">
                  {product.productName}
                </div>
                <div className="text-sm text-gray-600">
                  {product.sku} • {product.category}
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatCurrency(product.totalRevenue)}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                  {product.totalSold} vendidos
                </span>
                
                {/* Indicador de tendencia */}
                <div className={`
                  flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                  ${getTrendColor(index)}
                `}>
                  {getTrendIcon(index)}
                  {index === 0 ? '+15%' : index === 1 ? '0%' : '-8%'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl text-gray-400 mb-2">
            📦
          </div>
          <div className="text-gray-600">
            No hay productos para mostrar
          </div>
          <div className="text-sm text-gray-500 mt-1">
            No se registraron ventas en este período
          </div>
        </div>
      )}
    </motion.div>
  );
};
