import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CashDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCashCount: (cash: CashCount) => void;
  expectedAmount?: number;
  className?: string;
}

interface CashCount {
  bills: {
    1000: number;
    500: number;
    200: number;
    100: number;
    50: number;
    20: number;
  };
  coins: {
    10: number;
    5: number;
    2: number;
    1: number;
    0.5: number;
  };
}

// Cajón de efectivo para conteo y cierre de caja
export const CashDrawer: React.FC<CashDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onCashCount,
  expectedAmount,
  className = ''
}) => {
  const [cashCount, setCashCount] = useState<CashCount>({
    bills: { 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0 },
    coins: { 10: 0, 5: 0, 2: 0, 1: 0, 0.5: 0 }
  });

  const [isCounting, setIsCounting] = useState(false);

  const calculateTotal = (count: CashCount): number => {
    let total = 0;
    
    // Sumar billetes
    Object.entries(count.bills).forEach(([denomination, quantity]) => {
      total += parseFloat(denomination) * quantity;
    });
    
    // Sumar monedas
    Object.entries(count.coins).forEach(([denomination, quantity]) => {
      total += parseFloat(denomination) * quantity;
    });
    
    return total;
  };

  const totalAmount = calculateTotal(cashCount);
  const difference = expectedAmount ? totalAmount - expectedAmount : 0;

  const handleBillChange = (denomination: keyof CashCount['bills'], value: number) => {
    setCashCount(prev => ({
      ...prev,
      bills: {
        ...prev.bills,
        [denomination]: Math.max(0, value)
      }
    }));
  };

  const handleCoinChange = (denomination: keyof CashCount['coins'], value: number) => {
    setCashCount(prev => ({
      ...prev,
      coins: {
        ...prev.coins,
        [denomination]: Math.max(0, value)
      }
    }));
  };

  const handleSubmit = async () => {
    setIsCounting(true);
    
    try {
      // Simulación de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onCashCount(cashCount);
      setIsCounting(false);
      onClose();
    } catch (error) {
      setIsCounting(false);
      alert('Error al procesar conteo de efectivo');
    }
  };

  const handleReset = () => {
    setCashCount({
      bills: { 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0 },
      coins: { 10: 0, 5: 0, 2: 0, 1: 0, 0.5: 0 }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`
              bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-screen overflow-y-auto
              ${className}
            `}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Conteo de Efectivo
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Resumen del conteo */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Total Contado</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN'
                    }).format(totalAmount)}
                  </div>
                </div>
                
                {expectedAmount && (
                  <>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Esperado</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN'
                        }).format(expectedAmount)}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Diferencia</div>
                      <div className={`text-2xl font-bold ${
                        difference >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {difference >= 0 ? '+' : ''}
                        ${new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN'
                        }).format(Math.abs(difference))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Billetes */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billetes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(cashCount.bills).map(([denomination, count]) => (
                  <div key={denomination} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-center mb-2">
                      <div className="text-2xl font-bold text-gray-900">
                        ${parseInt(denomination)}
                      </div>
                      <div className="text-xs text-gray-500">billetes</div>
                    </div>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => handleBillChange(denomination as unknown as keyof CashCount['bills'], parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <div className="text-center mt-1 text-sm text-gray-600">
                      ${(parseInt(denomination) * count).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monedas */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monedas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(cashCount.coins).map(([denomination, count]) => (
                  <div key={denomination} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-center mb-2">
                      <div className="text-xl font-bold text-gray-900">
                        ${parseFloat(denomination)}
                      </div>
                      <div className="text-xs text-gray-500">monedas</div>
                    </div>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => handleCoinChange(denomination as unknown as keyof CashCount['coins'], parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <div className="text-center mt-1 text-sm text-gray-600">
                      ${(parseFloat(denomination) * count).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                disabled={isCounting}
              >
                Limpiar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled={isCounting}"
                disabled={isCounting}
              >
                {isCounting ? 'Procesando...' : 'Confirmar Conteo'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
