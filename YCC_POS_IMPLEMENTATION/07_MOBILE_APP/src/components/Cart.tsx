import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '../types/cart.types';

interface CartComponentProps {
  items: CartItem[];
  onItemUpdate: (itemId: string, updates: Partial<CartItem>) => void;
  onItemRemove: (itemId: string) => void;
  onCheckout: (customerInfo?: any, paymentMethod?: string, response?: any) => void;
  onClear: () => void;
  className?: string;
}

// Carrito de compras del POS
export const CartComponent: React.FC<CartComponentProps> = ({ 
  items, 
  onItemUpdate, 
  onItemRemove, 
  onCheckout,
  onClear,
  className = ''
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleItemUpdate = (itemId: string, updates: Partial<CartItem>) => {
    onItemUpdate(itemId, updates);
  };

  const handleItemRemove = (itemId: string) => {
    onItemRemove(itemId);
  };

  const handleCheckout = async (customerInfo?: any, paymentMethod?: string) => {
    setIsCheckingOut(true);
    
    try {
      // Aquí iría a la API Gateway para procesar el pago
      console.log('🔄 Procesando checkout...');
      
      // Simulación para desarrollo
      const response = {
        success: true,
        message: 'Checkout successful',
        data: {
          orderId: 'order_' + Date.now(),
          totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0)
        }
      };
      
      setTimeout(() => {
        setIsCheckingOut(false);
        onCheckout?.(customerInfo, paymentMethod, response);
      }, 1000);
      
    } catch (error) {
      setIsCheckingOut(false);
      console.error('❌ Error en checkout:', error);
    }
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <AnimatePresence>
      <motion.div
        className={className}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          transition: { type: 'spring', stiffness: 300, damping: 30 }
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.95
        }}
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Carrito de Compras
          </h2>
          
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🛒 El carrito está vacío</div>
              <p className="text-gray-600">Agrega productos para comenzar</p>
            </div>
          ) : (
            <>
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { type: 'spring', stiffness: 300, damping: 30 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: 50,
                    transition: { type: 'spring', stiffness: 300, damping: 30 }
                  }}
                  className="bg-white rounded-lg p-4 mb-4 border border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-start p-4">
                    <div className="flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.product.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">
                            ${new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'MXN'
                            }).format(item.unitPrice)}
                          </span>
                          <span className="text-sm text-gray-500">
                            x {item.quantity}
                          </span>
                          <span className="text-sm text-gray-500">
                            ${new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'MXN'
                            }).format(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">
                        {item.modifiers.length > 0 && (
                          <div className="text-xs text-gray-400">+{item.modifiers.length}</div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleItemUpdate(item.id, { quantity: item.quantity + 1 })}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors duration-200"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleItemUpdate(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                        >
                          -
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-lg font-bold text-gray-900">
                        ${new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN'
                        }).format(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleItemRemove(item.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">
                  Total: {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                  }).format(items.reduce((sum, item) => sum + item.totalPrice, 0))}
                </h3>
                
                <button
                  onClick={handleClear}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? 'Procesando...' : 'Limpiar Carrito'}
                </button>
                
                <button
                  onClick={handleCheckout}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  disabled={items.length === 0}
                >
                  {isCheckingOut ? 'Procesando...' : 'Procesar Compra'}
                </button>
              </div>
            </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
