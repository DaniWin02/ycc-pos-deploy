import { Plus, X, Users, ShoppingBag, Coffee, Package } from 'lucide-react';
import { useComandasStore } from '../stores/comandas.store';
import { ComandaType } from '../types';

const COMANDA_ICONS = {
  MESA: Users,
  LLEVAR: ShoppingBag,
  BARRA: Coffee,
  PEDIDO: Package
};

const COMANDA_COLORS = {
  MESA: 'bg-blue-500',
  LLEVAR: 'bg-green-500',
  BARRA: 'bg-purple-500',
  PEDIDO: 'bg-orange-500'
};

interface ComandasPanelProps {
  onNewComanda: () => void;
}

export function ComandasPanel({ onNewComanda }: ComandasPanelProps) {
  const { comandas, activeComandaId, setActiveComanda, deleteComanda, getComandaTotals } = useComandasStore();

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Comandas Activas ({comandas.filter(c => c.status === 'ACTIVE').length})
          </h2>
          <button
            onClick={onNewComanda}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </button>
        </div>

        {/* Lista de comandas */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {comandas.filter(c => c.status === 'ACTIVE').length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm w-full">
              No hay comandas activas. Crea una nueva para comenzar.
            </div>
          ) : (
            comandas
              .filter(c => c.status === 'ACTIVE')
              .map((comanda) => {
                const totals = getComandaTotals(comanda.id);
                const isActive = comanda.id === activeComandaId;
                const Icon = COMANDA_ICONS[comanda.tipo];
                const colorClass = COMANDA_COLORS[comanda.tipo];

                return (
                  <div
                    key={comanda.id}
                    onClick={() => setActiveComanda(comanda.id)}
                    className={`
                      relative flex-shrink-0 w-48 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${isActive 
                        ? 'border-emerald-500 bg-emerald-50 shadow-md scale-105' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    {/* Botón eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar comanda "${comanda.nombre}"?`)) {
                          deleteComanda(comanda.id);
                        }
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Icono y tipo */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-sm">
                          {comanda.nombre}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {comanda.tipo}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-semibold text-gray-900">{totals.itemCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold text-emerald-600">{fmt(totals.total)}</span>
                      </div>
                      {comanda.customerName && (
                        <div className="text-gray-500 truncate mt-1">
                          👤 {comanda.customerName}
                        </div>
                      )}
                    </div>

                    {/* Indicador activo */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-b-lg"></div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
