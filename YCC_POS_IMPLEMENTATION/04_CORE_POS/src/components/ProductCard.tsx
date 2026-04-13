import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types/product.types';
import { useResponsive } from '../hooks/useResponsive';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
  className?: string;
  disabled?: boolean;
}

// Tarjeta de producto para el catálogo del POS
export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onQuickAdd,
  className = '',
  disabled = false 
}) => {
  const { isMobile } = useResponsive();
  
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const handleQuickAdd = () => {
    if (onQuickAdd) {
      onQuickAdd(product);
    }
  };

  return (
    <motion.div
      className={`
        bg-white rounded-xl shadow-md p-fluid-sm cursor-pointer transition-all duration-200 
        hover:shadow-lg hover:scale-[1.02] active:scale-100
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}
        ${className}
        touch-target
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={disabled ? undefined : handleAddToCart}
      layout
    >
      <div className="flex flex-col sm:flex-row gap-fluid-sm">
        {/* Imagen/Icono del producto */}
        <div className="flex-shrink-0">
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-100 rounded-xl flex items-center justify-center shadow-inner">
            <span className="text-fluid-2xl font-bold text-gray-400">
              {product.name.charAt(0)}
            </span>
          </div>
        </div>
        
        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <div>
            <h3 className="text-fluid-base font-bold text-gray-900 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-fluid-sm text-gray-600 mt-1 line-clamp-2">
              {product.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-fluid-lg font-bold text-green-600">
                ${new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN'
                }).format(product.price)}
              </span>
              {product.trackInventory && (
                <span className="text-fluid-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  📦 {product.currentStock}
                </span>
              )}
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="mt-fluid-sm flex flex-col sm:flex-row gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              className="touch-target flex-1 bg-blue-600 text-white px-fluid-sm py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 text-fluid-sm font-semibold flex items-center justify-center gap-1"
            >
              <span>🛒</span> Agregar
            </button>
            
            {onQuickAdd && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAdd();
                }}
                className="touch-target flex-1 bg-green-600 text-white px-fluid-sm py-2 rounded-lg hover:bg-green-700 active:scale-95 transition-all duration-200 text-fluid-sm font-semibold flex items-center justify-center gap-1"
              >
                <span>⚡</span> Rápido
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
