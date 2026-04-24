import { Plus, Users, ShoppingBag, Coffee, Package, X, Clock, AlertTriangle, Search, CreditCard } from 'lucide-react';
import { useComandasStore } from '../stores/comandas.store';
import type { ComandaType } from '../types';
import { useEffect, useState } from 'react';

const COMANDA_ICONS: Record<ComandaType, typeof Users> = {
  MESA: Users,
  LLEVAR: ShoppingBag,
  BARRA: Coffee,
  PEDIDO: Package
};

const COMANDA_COLORS = {
  MESA: 'bg-blue-500',
  LLEVAR: 'bg-emerald-500',
  BARRA: 'bg-purple-500',
  PEDIDO: 'bg-orange-500'
};

interface ComandasPanelProps {
  onNewComanda: () => void;
  onPayComanda?: (comandaId: string) => void;
}

export function ComandasPanel({ onNewComanda, onPayComanda }: ComandasPanelProps) {
  const { 
    comandas, 
    activeComandaId, 
    setActiveComanda, 
    deleteComanda, 
    getComandaTotals, 
    getComandaTimeDisplay,
    getGlobalTotals,
    alerts,
    dismissAlert,
    lastAddedToComanda,
    clearLastAdded,
    checkTimeAlerts
  } = useComandasStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [, setNow] = useState(Date.now());

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const activeComandas = comandas.filter(c => c.status === 'ACTIVE');
  const globalTotals = getGlobalTotals();

  // Actualizar timer cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      checkTimeAlerts();
    }, 60000);
    return () => clearInterval(interval);
  }, [checkTimeAlerts]);

  // Atajos de teclado Ctrl+1, Ctrl+2, etc.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < activeComandas.length) {
          setActiveComanda(activeComandas[index].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeComandas, setActiveComanda]);

  // Limpiar animación de "agregado" después de 2 segundos
  useEffect(() => {
    if (lastAddedToComanda) {
      const timeout = setTimeout(clearLastAdded, 2000);
      return () => clearTimeout(timeout);
    }
  }, [lastAddedToComanda, clearLastAdded]);

  const filteredComandas = searchQuery 
    ? activeComandas.filter(c => 
        c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeComandas;

  // Si no hay comandas, mostrar solo el botón de nueva
  if (activeComandas.length === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100/50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onNewComanda}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold shadow-sm active:scale-95 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Comanda</span>
          </button>
          <span className="text-sm text-gray-400">No hay comandas activas</span>
        </div>
        <div className="text-xs text-gray-400">
          Atajo: <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">1-9</kbd>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 border-b border-gray-200">
      {/* Alertas de tiempo */}
      {alerts.length > 0 && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-800 font-medium">Alertas de tiempo:</span>
            {alerts.map(alert => (
              <button
                key={alert.id}
                onClick={() => {
                  dismissAlert(alert.id);
                  setActiveComanda(alert.comandaId);
                }}
                className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
              >
                {alert.message}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Barra de herramientas: búsqueda + resumen global */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar comanda..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {filteredComandas.length !== activeComandas.length && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {filteredComandas.length} de {activeComandas.length}
            </span>
          )}
        </div>
        
        {/* Resumen global */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            <strong className="text-gray-900">{globalTotals.totalComandas}</strong> comandas
          </span>
          <span className="text-gray-600">
            <strong className="text-gray-900">{globalTotals.totalItems}</strong> items
          </span>
          <span className="text-gray-600">
            Total: <strong className="text-emerald-600">{fmt(globalTotals.totalAmount)}</strong>
          </span>
          <div className="text-xs text-gray-400 ml-2">
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">1-9</kbd>
          </div>
        </div>
      </div>

      {/* Barra de pestañas tipo navegador */}
      <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
        {/* Botón nueva comanda (siempre visible al inicio) */}
        <button
          onClick={onNewComanda}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm active:scale-95 min-h-[40px] mr-2"
          title="Nueva Comanda"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva</span>
        </button>

        {/* Separador visual */}
        <div className="w-px h-8 bg-gray-300 mx-1 flex-shrink-0" />

        {/* Pestañas de comandas */}
        {filteredComandas.map((comanda, index) => {
          const totals = getComandaTotals(comanda.id);
          const isActive = comanda.id === activeComandaId;
          const Icon = COMANDA_ICONS[comanda.tipo];
          const colorClass = COMANDA_COLORS[comanda.tipo];
          const hasItems = totals.itemCount > 0;

          const elapsedTime = getComandaTimeDisplay(comanda.id);
          const wasJustAdded = lastAddedToComanda === comanda.id;
          const shortcutNumber = index + 1;

          return (
            <div
              key={comanda.id}
              onClick={() => setActiveComanda(comanda.id)}
              className={`
                relative flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer
                transition-all duration-150 min-w-[140px] max-w-[200px]
                border-t-2 border-l border-r
                ${isActive 
                  ? `bg-white ${colorClass.replace('bg-', 'border-')} border-b-0 shadow-sm -mb-px z-10` 
                  : 'bg-gray-200/70 border-gray-300 hover:bg-gray-200 border-b border-gray-300'
                }
                ${wasJustAdded ? 'ring-2 ring-emerald-400 ring-offset-1 animate-pulse' : ''}
              `}
            >
              {/* Icono del tipo */}
              <div className={`w-6 h-6 ${colorClass} rounded flex items-center justify-center flex-shrink-0 relative`}>
                <Icon className="w-3.5 h-3.5 text-white" />
                {/* Número de atajo */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-700 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {shortcutNumber}
                </span>
              </div>

              {/* Info de la comanda */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold text-sm truncate ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                    {comanda.nombre}
                  </span>
                  {hasItems && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium transition-all ${wasJustAdded ? 'bg-emerald-500 text-white scale-110' : isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-300 text-gray-600'}`}>
                      {totals.itemCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasItems && (
                    <span className={`text-xs font-medium ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {fmt(totals.total)}
                    </span>
                  )}
                  {/* Timer */}
                  <span className={`text-[10px] flex items-center gap-0.5 ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
                    <Clock className="w-3 h-3" />
                    {elapsedTime}
                  </span>
                </div>
              </div>

              {/* Botón Cerrar (X) - SIEMPRE visible en esquina superior derecha */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`¿Cerrar comanda "${comanda.nombre}"?\n\n${hasItems ? 'ADVERTENCIA: Tiene items agregados' : 'Comanda vacía'}`)) {
                    deleteComanda(comanda.id);
                  }
                }}
                className={`
                  absolute -top-1 -right-1 z-20
                  flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                  transition-all active:scale-90 shadow-sm
                  ${isActive 
                    ? 'bg-red-100 text-red-500 hover:bg-red-500 hover:text-white' 
                    : 'bg-gray-200 text-gray-400 hover:bg-red-400 hover:text-white'
                  }
                `}
                title="Cerrar comanda"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Botón Cobrar - solo visible si tiene items y hay callback */}
              {hasItems && onPayComanda && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveComanda(comanda.id);
                    onPayComanda(comanda.id);
                  }}
                  className={`
                    flex-shrink-0 w-6 h-6 rounded flex items-center justify-center
                    transition-all active:scale-90
                    ${isActive 
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm' 
                      : 'bg-gray-300 text-gray-600 hover:bg-emerald-500 hover:text-white'
                    }
                  `}
                  title={`Cobrar ${comanda.nombre} - ${fmt(totals.total)}`}
                >
                  <CreditCard className="w-3 h-3" />
                </button>
              )}

            </div>
          );
        })} 
      </div>
    </div>
  );
}
