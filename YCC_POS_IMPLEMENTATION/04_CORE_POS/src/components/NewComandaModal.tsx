import { useState } from 'react';
import { X, Users, ShoppingBag, Coffee, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComandaType } from '../types';

interface NewComandaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (nombre: string, tipo: ComandaType) => void;
}

const TIPOS_COMANDA = [
  { tipo: 'MESA' as ComandaType, label: 'Mesa', icon: Users, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
  { tipo: 'LLEVAR' as ComandaType, label: 'Para Llevar', icon: ShoppingBag, color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
  { tipo: 'BARRA' as ComandaType, label: 'Barra', icon: Coffee, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' },
  { tipo: 'PEDIDO' as ComandaType, label: 'Pedido', icon: Package, color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600' }
];

export function NewComandaModal({ isOpen, onClose, onCreate }: NewComandaModalProps) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<ComandaType>('MESA');
  const [numeroMesa, setNumeroMesa] = useState('');

  const handleCreate = () => {
    let finalNombre = nombre.trim();
    
    // Si es mesa y hay número, usar formato "Mesa X"
    if (tipo === 'MESA' && numeroMesa) {
      finalNombre = `Mesa ${numeroMesa}`;
    }
    
    // Si no hay nombre, generar uno automático
    if (!finalNombre) {
      const timestamp = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      finalNombre = `${TIPOS_COMANDA.find(t => t.tipo === tipo)?.label} ${timestamp}`;
    }
    
    onCreate(finalNombre, tipo);
    
    // Reset form
    setNombre('');
    setNumeroMesa('');
    setTipo('MESA');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Nueva Comanda</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Tipo de comanda */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tipo de Comanda
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TIPOS_COMANDA.map((item) => {
                      const Icon = item.icon;
                      const isSelected = tipo === item.tipo;
                      
                      return (
                        <button
                          key={item.tipo}
                          onClick={() => setTipo(item.tipo)}
                          className={`
                            p-4 rounded-xl border-2 transition-all
                            ${isSelected 
                              ? `${item.color} border-transparent text-white shadow-lg scale-105` 
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }
                          `}
                        >
                          <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                          <span className="font-semibold text-sm">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Número de mesa (solo si tipo es MESA) */}
                {tipo === 'MESA' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de Mesa
                    </label>
                    <input
                      type="text"
                      value={numeroMesa}
                      onChange={(e) => setNumeroMesa(e.target.value)}
                      placeholder="Ej: 1, 2, 3..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-semibold text-center"
                      autoFocus
                    />
                  </div>
                )}

                {/* Nombre personalizado (opcional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Personalizado (Opcional)
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Juan Pérez, Pedido Especial..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si no especificas un nombre, se generará automáticamente
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold shadow-lg"
                >
                  Crear Comanda
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
