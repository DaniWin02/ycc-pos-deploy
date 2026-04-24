import { useState } from 'react';
import { X, Users, ShoppingBag, Coffee, Package, Plus } from 'lucide-react';
import { ComandaType } from '../types';

interface NewComandaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (nombre: string, tipo: ComandaType) => void;
}

const TIPOS_COMANDA = [
  { tipo: 'MESA' as ComandaType, label: 'Mesa', icon: Users, color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { tipo: 'LLEVAR' as ComandaType, label: 'Para Llevar', icon: ShoppingBag, color: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
  { tipo: 'BARRA' as ComandaType, label: 'Barra', icon: Coffee, color: 'bg-purple-500', hover: 'hover:bg-purple-600' },
  { tipo: 'PEDIDO' as ComandaType, label: 'Pedido', icon: Package, color: 'bg-orange-500', hover: 'hover:bg-orange-600' }
];

const NUMEROS_RAPIDOS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export function NewComandaModal({ isOpen, onClose, onCreate }: NewComandaModalProps) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<ComandaType>('MESA');
  const [numeroMesa, setNumeroMesa] = useState('');

  const handleCreate = () => {
    let finalNombre = nombre.trim();
    
    if (tipo === 'MESA' && numeroMesa) {
      finalNombre = `Mesa ${numeroMesa}`;
    }
    
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Nueva Comanda</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors active:scale-90"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 md:p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-180px)]">
            {/* Tipo de comanda */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tipo de Comanda
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS_COMANDA.map((item) => {
                  const Icon = item.icon;
                  const isSelected = tipo === item.tipo;
                  
                  return (
                    <button
                      key={item.tipo}
                      onClick={() => setTipo(item.tipo)}
                      className={`
                        p-3 rounded-xl border-2 transition-all min-h-[80px]
                        ${isSelected 
                          ? `${item.color} border-transparent text-white shadow-md` 
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50'
                        }
                      `}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                      <span className="font-semibold text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Número de mesa */}
            {tipo === 'MESA' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Número de Mesa
                </label>
                <input
                  type="text"
                  value={numeroMesa}
                  onChange={(e) => setNumeroMesa(e.target.value)}
                  placeholder="Ej: 1, 2, 3..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-bold text-center mb-2"
                  autoFocus
                />
                <div className="grid grid-cols-6 gap-1.5">
                  {NUMEROS_RAPIDOS.map((num) => (
                    <button
                      key={num}
                      onClick={() => setNumeroMesa(num)}
                      className={`
                        py-2 rounded-lg font-bold text-sm transition-all active:scale-90
                        ${numeroMesa === num 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nombre personalizado */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nombre (Opcional)
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-4 md:p-5 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
