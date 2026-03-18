import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, User, MapPin, Phone, Clock, Send, X, Check } from 'lucide-react';
import { CartItem } from '../types';

interface DeliveryModeProps {
  items: CartItem[];
  total: number;
  onCreateDelivery: (customerName: string, phone: string, address: string) => void;
  onCancel: () => void;
}

export const DeliveryMode: React.FC<DeliveryModeProps> = ({ items, total, onCreateDelivery, onCancel }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [step, setStep] = useState<'customer' | 'address' | 'confirm'>('customer');

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  const handleSubmit = () => {
    if (step === 'customer' && customerName && phone) {
      setStep('address');
    } else if (step === 'address' && address) {
      setStep('confirm');
    } else if (step === 'confirm') {
      onCreateDelivery(customerName, phone, address);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Pedido a Domicilio</h2>
                <p className="text-purple-100 text-sm">
                  {step === 'customer' && 'Datos del cliente'}
                  {step === 'address' && 'Dirección de entrega'}
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
            <div className={`flex-1 h-1 rounded-full ${step === 'customer' || step === 'address' || step === 'confirm' ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-1 rounded-full ${step === 'address' || step === 'confirm' ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-1 rounded-full ${step === 'confirm' ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Customer Info */}
          {step === 'customer' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 dígitos"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-purple-900">Tiempo estimado</p>
                    <p className="text-sm text-purple-700">30-45 minutos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Address */}
          {step === 'address' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-purple-700">
                  <User className="w-5 h-5" />
                  <span className="font-semibold">{customerName}</span>
                  <span className="text-purple-500">•</span>
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{phone}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Dirección de entrega
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, colonia, referencias..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  autoFocus
                />
              </div>

              <button
                onClick={() => setStep('customer')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                ← Editar datos del cliente
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
                  <span className="text-gray-600">Cliente</span>
                  <span className="font-bold text-gray-900">{customerName}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Teléfono</span>
                  <span className="font-bold text-gray-900">{phone}</span>
                </div>
                <div className="flex items-start justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Dirección</span>
                  <span className="font-bold text-gray-900 text-right max-w-xs">{address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-purple-600 text-xl">{fmt(total)}</span>
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

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-900">Tiempo estimado de entrega</p>
                    <p className="text-sm text-purple-700">30-45 minutos</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('address')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
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
              (step === 'customer' && (!customerName || !phone)) ||
              (step === 'address' && !address)
            }
            className={`
              flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
              ${(step === 'customer' && (!customerName || !phone)) || (step === 'address' && !address)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
              }
            `}
          >
            {step === 'confirm' ? (
              <>
                <Send className="w-5 h-5" />
                Crear Pedido
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
