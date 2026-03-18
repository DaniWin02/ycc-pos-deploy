import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types/product.types';

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
        bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 
        hover:shadow-lg hover:scale-105 active:scale-100
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={disabled ? undefined : handleAddToCart}
      layout
    >
      <div className="relative h-48 w-full">
        {/* Imagen del producto */}
        <div className="h-32 w-32 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-400">
            {product.name.charAt(0)}
          </div>
        </div>
        
        {/* Información del producto */}
        <div className="ml-4 flex-1">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {product.description}
            </p>
            <div className="flex items-center mt-2">
              <span className="text-2xl font-bold text-green-600">
                ${new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN'
                }).format(product.price)}
              </span>
              {product.trackInventory && (
                <span className="ml-2 text-sm text-gray-500">
                  Stock: {product.currentStock}
                </span>
              )}
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Agregar al Carrito
            </button>
            
            {onQuickAdd && (
              <button
                onClick={handleQuickAdd}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Venta Rápida
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
