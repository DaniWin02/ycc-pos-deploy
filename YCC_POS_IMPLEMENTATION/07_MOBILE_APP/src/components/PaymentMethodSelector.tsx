import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentMethod, PaymentRequest } from '../types/payment.types';

interface PaymentMethodSelectorProps {
  totalAmount: number;
  onPaymentComplete: (payment: PaymentRequest) => void;
  onBack?: () => void;
  className?: string;
  disabled?: boolean;
}

// Selector de método de pago para el POS
export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ 
  totalAmount, 
  onPaymentComplete, 
  onBack,
  className = '',
  disabled = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [memberNumber, setMemberNumber] = useState('');

  const paymentMethods = [
    {
      method: PaymentMethod.CASH,
      name: 'Efectivo',
      icon: '💵',
      description: 'Pago en efectivo',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      method: PaymentMethod.CARD,
      name: 'Tarjeta',
      icon: '💳',
      description: 'Tarjeta de crédito/débito',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      method: PaymentMethod.MEMBER_ACCOUNT,
      name: 'Cuenta Socio',
      icon: '👤',
      description: 'Cargo a cuenta de socio',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setCashAmount('');
    setCardData({ cardNumber: '', cardHolderName: '', expiryDate: '', cvv: '' });
    setMemberNumber('');
  };

  const handleCashPayment = async () => {
    if (!cashAmount || parseFloat(cashAmount) < totalAmount) {
      alert('El monto efectivo debe ser mayor o igual al total');
      return;
    }

    setIsProcessing(true);

    try {
      const payment: PaymentRequest = {
        method: PaymentMethod.CASH,
        amount: totalAmount,
        reference: `CASH_${Date.now()}`
      };

      // Simulación de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));

      onPaymentComplete(payment);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      alert('Error al procesar pago en efectivo');
    }
  };

  const handleCardPayment = async () => {
    if (!cardData.cardNumber || !cardData.cardHolderName || !cardData.expiryDate || !cardData.cvv) {
      alert('Por favor complete todos los datos de la tarjeta');
      return;
    }

    setIsProcessing(true);

    try {
      const payment: PaymentRequest = {
        method: PaymentMethod.CARD,
        amount: totalAmount,
        customerPaymentData: {
          cardNumber: cardData.cardNumber,
          cardHolderName: cardData.cardHolderName,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv
        }
      };

      // Simulación de procesamiento de tarjeta
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockAuthCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      payment.authorizationCode = mockAuthCode;

      onPaymentComplete(payment);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      alert('Error al procesar pago con tarjeta');
    }
  };

  const handleMemberPayment = async () => {
    if (!memberNumber) {
      alert('Por favor ingrese el número de socio');
      return;
    }

    setIsProcessing(true);

    try {
      const payment: PaymentRequest = {
        method: PaymentMethod.MEMBER_ACCOUNT,
        amount: totalAmount,
        memberNumber: memberNumber
      };

      // Simulación de validación de socio
      await new Promise(resolve => setTimeout(resolve, 1000));

      onPaymentComplete(payment);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      alert('Error al procesar pago con cuenta de socio');
    }
  };

  const handlePayment = () => {
    switch (selectedMethod) {
      case PaymentMethod.CASH:
        handleCashPayment();
        break;
      case PaymentMethod.CARD:
        handleCardPayment();
        break;
      case PaymentMethod.MEMBER_ACCOUNT:
        handleMemberPayment();
        break;
    }
  };

  const changeAmount = parseFloat(cashAmount) || 0;
  const change = selectedMethod === PaymentMethod.CASH ? changeAmount - totalAmount : 0;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Seleccionar Método de Pago
        </h2>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900">
            Total: ${new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN'
            }).format(totalAmount)}
          </div>
        </div>

        {/* Selección de método de pago */}
        {!selectedMethod && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {paymentMethods.map((method) => (
              <motion.button
                key={method.method}
                onClick={() => handleMethodSelect(method.method)}
                className={`
                  ${method.color} text-white rounded-lg p-6 text-center
                  transition-all duration-200 transform hover:scale-105
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={disabled}
              >
                <div className="text-4xl mb-2">{method.icon}</div>
                <div className="text-lg font-semibold">{method.name}</div>
                <div className="text-sm opacity-90">{method.description}</div>
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedMethod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Formulario de pago en efectivo */}
              {selectedMethod === PaymentMethod.CASH && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pago en Efectivo
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto Recibido
                      </label>
                      <input
                        type="number"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isProcessing}
                      />
                    </div>
                    {changeAmount > 0 && (
                      <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                        <div className="text-green-800">
                          <div className="font-semibold">Cambio:</div>
                          <div className="text-2xl font-bold">
                            ${new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'MXN'
                            }).format(change)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Formulario de pago con tarjeta */}
              {selectedMethod === PaymentMethod.CARD && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pago con Tarjeta
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isProcessing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Titular
                      </label>
                      <input
                        type="text"
                        value={cardData.cardHolderName}
                        onChange={(e) => setCardData({...cardData, cardHolderName: e.target.value})}
                        placeholder="Juan Pérez"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Vencimiento
                        </label>
                        <input
                          type="text"
                          value={cardData.expiryDate}
                          onChange={(e) => setCardData({...cardData, expiryDate: e.target.value})}
                          placeholder="MM/AA"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isProcessing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario de pago con cuenta de socio */}
              {selectedMethod === PaymentMethod.MEMBER_ACCOUNT && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pago con Cuenta de Socio
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Socio
                      </label>
                      <input
                        type="text"
                        value={memberNumber}
                        onChange={(e) => setMemberNumber(e.target.value)}
                        placeholder="SOC-001234"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  disabled={isProcessing}
                >
                  Volver
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled={isProcessing}"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Procesando...' : 'Pagar'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
