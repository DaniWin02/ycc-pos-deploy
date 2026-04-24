import React, { useState } from 'react';
import { X, UserPlus, Award, User, UserCheck, Building2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerStore, CustomerType } from '../stores/customer.store';

const TYPE_OPTIONS: { value: CustomerType; label: string; icon: any; color: string }[] = [
  { value: 'CLIENTE', label: 'Cliente', icon: User, color: 'text-blue-600' },
  { value: 'SOCIO', label: 'Socio', icon: Award, color: 'text-purple-600' },
  { value: 'INVITADO', label: 'Invitado', icon: UserCheck, color: 'text-gray-600' },
  { value: 'CORPORATIVO', label: 'Corporativo', icon: Building2, color: 'text-amber-600' },
];

interface QuickCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickCustomerModal: React.FC<QuickCustomerModalProps> = ({ isOpen, onClose }) => {
  const { createQuickCustomer } = useCustomerStore();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<CustomerType>('CLIENTE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const customer = await createQuickCustomer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        type
      });

      if (customer) {
        // Reset form and close
        setFirstName('');
        setLastName('');
        setPhone('');
        setType('CLIENTE');
        onClose();
      } else {
        setError('Error creando el cliente. Intenta de nuevo.');
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFirstName('');
      setLastName('');
      setPhone('');
      setType('CLIENTE');
      setError('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <UserPlus className="w-5 h-5" />
                <h2 className="font-semibold text-lg">Nuevo Cliente</h2>
              </div>
              <button 
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Juan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Pérez"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="5551234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cliente
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setType(option.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          type === option.value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${option.color}`} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info note */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                <p>
                  {type === 'SOCIO' 
                    ? 'Se generará automáticamente un número de socio.' 
                    : 'El cliente podrá ser buscado por nombre o teléfono en futuras compras.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !firstName.trim()}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Crear Cliente
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
