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
        <div className="bg-white rounded-lg shadow-lg p-fluid-md">
          <h2 className="text-fluid-xl font-bold text-gray-900 mb-fluid-sm">
            Carrito de Compras
          </h2>
          
          {items.length === 0 ? (
            <div className="text-center py-fluid-lg text-gray-500">
              <div className="text-fluid-3xl mb-4">🛒</div>
              <p className="text-fluid-base text-gray-600">El carrito está vacío</p>
              <p className="text-fluid-sm text-gray-500">Agrega productos para comenzar</p>
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
                  className="bg-white rounded-lg p-fluid-sm mb-fluid-sm border border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-fluid-sm">
                    <div className="flex-1 min-w-0">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-fluid-base">
                          {item.product.name}
                        </h3>
                        <p className="text-fluid-sm text-gray-600 line-clamp-1">
                          {item.product.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-fluid-lg font-bold text-green-600">
                            ${new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'MXN'
                            }).format(item.unitPrice)}
                          </span>
                          <span className="text-fluid-sm text-gray-500">
                            x {item.quantity}
                          </span>
                          <span className="text-fluid-sm font-semibold text-gray-700">
                            ${new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'MXN'
                            }).format(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.modifiers.length > 0 && (
                        <span className="text-fluid-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          +{item.modifiers.length}
                        </span>
                      )}
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleItemUpdate(item.id, { quantity: item.quantity + 1 })}
                          className="touch-target bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 active:scale-95 transition-all duration-200 text-fluid-lg font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleItemUpdate(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                          className="touch-target bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 active:scale-95 transition-all duration-200 text-fluid-lg font-bold"
                        >
                          −
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-fluid-lg font-bold text-gray-900 whitespace-nowrap">
                      ${new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN'
                      }).format(item.totalPrice)}
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleItemRemove(item.id)}
                      className="touch-target bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 active:scale-95 transition-all duration-200 text-fluid-sm font-medium"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-fluid-md border-t border-gray-200 pt-fluid-sm">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-fluid-sm">
                <h3 className="text-fluid-xl font-bold text-gray-900">
                  Total: {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                  }).format(items.reduce((sum, item) => sum + item.totalPrice, 0))}
                </h3>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleClear}
                    className="touch-target-comfortable flex-1 sm:flex-none bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 active:scale-95 transition-all duration-200 text-fluid-base font-medium"
                    disabled={isCheckingOut}
                  >
                    🗑️ {isCheckingOut ? 'Procesando...' : 'Limpiar'}
                  </button>
                  
                  <button
                    onClick={handleCheckout}
                    className="touch-target-comfortable flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 text-fluid-base font-bold shadow-lg"
                    disabled={items.length === 0}
                  >
                    💳 {isCheckingOut ? 'Procesando...' : 'Pagar'}
                  </button>
                </div>
              </div>
            </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
