import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, User, Send, X, Check } from 'lucide-react';
import { CartItem } from '../types';

interface TableModeProps {
  items: CartItem[];
  total: number;
  onSendToKitchen: (tableNumber: string, customerName: string) => void;
  onCancel: () => void;
}

export const TableMode: React.FC<TableModeProps> = ({ items, total, onSendToKitchen, onCancel }) => {
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [step, setStep] = useState<'table' | 'customer' | 'confirm'>('table');

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  const handleSubmit = () => {
    if (step === 'table' && tableNumber) {
      setStep('customer');
    } else if (step === 'customer' && customerName) {
      setStep('confirm');
    } else if (step === 'confirm') {
      onSendToKitchen(tableNumber, customerName);
    }
  };

  const tables = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Servicio de Mesa</h2>
                <p className="text-blue-100 text-sm">
                  {step === 'table' && 'Selecciona la mesa'}
                  {step === 'customer' && 'Datos del cliente'}
                  {step === 'confirm' && 'Confirmar pedido'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mt-4">
            <div className={`flex-1 h-1 rounded-full ${step === 'table' || step === 'customer' || step === 'confirm' ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-1 rounded-full ${step === 'customer' || step === 'confirm' ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-1 rounded-full ${step === 'confirm' ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Select Table */}
          {step === 'table' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-5 gap-3">
                {tables.map((table) => (
                  <button
                    key={table}
                    onClick={() => setTableNumber(table)}
                    className={`
                      aspect-square rounded-xl font-bold text-lg transition-all
                      ${tableNumber === table
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {table}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O ingresa el número de mesa
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Ej: 21, VIP-1, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Customer Info */}
          {step === 'customer' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-700">
                  <Utensils className="w-5 h-5" />
                  <span className="font-semibold">Mesa {tableNumber}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Nombre del cliente
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <button
                onClick={() => setStep('table')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Cambiar mesa
              </button>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Mesa</span>
                  <span className="font-bold text-gray-900">{tableNumber}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Cliente</span>
                  <span className="font-bold text-gray-900">{customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-blue-600 text-xl">{fmt(total)}</span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Productos ({items.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-900">{fmt(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('customer')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Editar información
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              (step === 'table' && !tableNumber) ||
              (step === 'customer' && !customerName)
            }
            className={`
              flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
              ${(step === 'table' && !tableNumber) || (step === 'customer' && !customerName)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }
            `}
          >
            {step === 'confirm' ? (
              <>
                <Send className="w-5 h-5" />
                Enviar a Cocina
              </>
            ) : (
              <>
                Continuar
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
