import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, LogOut, Clock, CheckCircle, Package, MapPin, Phone,
  Utensils, Truck, Home, Store, AlertCircle, RefreshCw,
  ChevronRight, Bell, QrCode, Navigation, Check, X, ArrowLeft
} from 'lucide-react';

// ===================== TYPES =====================
interface Comanda {
  id: string;
  folio: string;
  cliente: string;
  mesa?: string;
  domicilio?: string;
  telefono?: string;
  tipo: 'MESA' | 'DOMICILIO' | 'LLEVAR';
  estado: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGANDO' | 'ENTREGADO';
  items: ComandaItem[];
  total: number;
  createdAt: string;
  tiempoEspera: number;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  asignadoA?: string;
}

interface ComandaItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  notas?: string;
}

type UserRole = 'MESERO' | 'DELIVERY';
type Screen = 'login' | 'dashboard' | 'comanda-detail';

// ===================== HELPERS =====================
const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'PENDIENTE': return 'bg-yellow-500';
    case 'PREPARANDO': return 'bg-blue-500';
    case 'LISTO': return 'bg-green-500';
    case 'ENTREGANDO': return 'bg-purple-500';
    case 'ENTREGADO': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

const getPrioridadColor = (prioridad: string) => {
  switch (prioridad) {
    case 'URGENTE': return 'bg-red-100 text-red-800 border-red-300';
    case 'ALTA': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'MEDIA': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'BAJA': return 'bg-gray-100 text-gray-800 border-gray-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// ===================== APP =====================
export const MobileApp: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('login');
  const [userRole, setUserRole] = useState<UserRole>('MESERO');
  const [userName, setUserName] = useState('');
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar comandas desde el API
  const loadComandas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3004/comandas?t=${Date.now()}`);
      if (!response.ok) throw new Error('Error cargando comandas');
      
      const data = await response.json();
      
      // Filtrar comandas según el rol
      const filteredComandas = data.filter((c: Comanda) => {
        if (userRole === 'MESERO') {
          return c.tipo === 'MESA' && c.estado !== 'ENTREGADO';
        } else {
          return c.tipo === 'DOMICILIO' && c.estado !== 'ENTREGADO';
        }
      });
      
      setComandas(filteredComandas);
    } catch (error) {
      console.error('Error cargando comandas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de comanda
  const updateEstado = async (comandaId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`http://localhost:3004/comandas/${comandaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) throw new Error('Error actualizando estado');
      
      await loadComandas();
      if (selectedComanda?.id === comandaId) {
        setSelectedComanda({ ...selectedComanda, estado: nuevoEstado as any });
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (screen === 'dashboard') {
      loadComandas();
      const interval = setInterval(loadComandas, 30000);
      return () => clearInterval(interval);
    }
  }, [screen, userRole]);

  // ===================== LOGIN SCREEN =====================
  if (screen === 'login') {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">YCC Mobile</h1>
            <p className="text-gray-600 mt-2">Gestión de Comandas</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUserRole('MESERO')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userRole === 'MESERO'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <Utensils className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium">Mesero</span>
                </button>
                <button
                  onClick={() => setUserRole('DELIVERY')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userRole === 'DELIVERY'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <Truck className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium">Delivery</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (userName.trim()) {
                  setScreen('dashboard');
                } else {
                  alert('Por favor ingresa tu nombre');
                }
              }}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===================== DASHBOARD SCREEN =====================
  if (screen === 'dashboard') {
    const comandasPendientes = comandas.filter(c => c.estado === 'LISTO' || c.estado === 'ENTREGANDO');
    const comandasCompletadas = comandas.filter(c => c.estado === 'ENTREGADO');

    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                {userRole === 'MESERO' ? (
                  <Utensils className="w-5 h-5 text-white" />
                ) : (
                  <Truck className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{userName}</h1>
                <p className="text-xs text-gray-600">{userRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadComandas}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => {
                  setScreen('login');
                  setUserName('');
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{comandasPendientes.length}</p>
              <p className="text-xs text-gray-600">Pendientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{comandasCompletadas.length}</p>
              <p className="text-xs text-gray-600">Completadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{comandas.length}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </div>

        {/* Comandas List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && comandas.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-3" />
                <p className="text-gray-600">Cargando comandas...</p>
              </div>
            </div>
          ) : comandas.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No hay comandas pendientes</p>
                <p className="text-sm text-gray-500 mt-1">Las nuevas comandas aparecerán aquí</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {comandas.map((comanda) => (
                <motion.div
                  key={comanda.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setSelectedComanda(comanda);
                    setScreen('comanda-detail');
                  }}
                  className={`bg-white rounded-xl border-2 p-4 shadow-sm active:scale-95 transition-transform ${getPrioridadColor(comanda.prioridad)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-gray-900">{comanda.folio}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getEstadoColor(comanda.estado)}`}>
                          {comanda.estado}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{comanda.cliente}</p>
                      {comanda.mesa && (
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                          <Store className="w-3 h-3" />
                          {comanda.mesa}
                        </p>
                      )}
                      {comanda.telefono && (
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {comanda.telefono}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{fmt(comanda.total)}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 justify-end mt-1">
                        <Clock className="w-3 h-3" />
                        {comanda.tiempoEspera} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-600">{comanda.items.length} productos</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===================== COMANDA DETAIL SCREEN =====================
  if (screen === 'comanda-detail' && selectedComanda) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreen('dashboard')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-gray-900">{selectedComanda.folio}</h1>
              <p className="text-xs text-gray-600">{selectedComanda.cliente}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getEstadoColor(selectedComanda.estado)}`}>
              {selectedComanda.estado}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">Información</h2>
            <div className="space-y-2">
              {selectedComanda.mesa && (
                <div className="flex items-center gap-2 text-sm">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{selectedComanda.mesa}</span>
                </div>
              )}
              {selectedComanda.telefono && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{selectedComanda.telefono}</span>
                </div>
              )}
              {selectedComanda.domicilio && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{selectedComanda.domicilio}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">Tiempo: {selectedComanda.tiempoEspera} minutos</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <h2 className="font-semibold text-gray-900 mb-3">Productos</h2>
            <div className="space-y-3">
              {selectedComanda.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.nombre}</p>
                    {item.notas && (
                      <p className="text-xs text-gray-600 mt-1">{item.notas}</p>
                    )}
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-medium text-gray-900">{item.cantidad}x</p>
                    <p className="text-sm text-gray-600">{fmt(item.precio)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 mt-3 border-t-2 border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-xl text-gray-900">{fmt(selectedComanda.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="space-y-2">
            {selectedComanda.estado === 'LISTO' && (
              <button
                onClick={() => updateEstado(selectedComanda.id, 'ENTREGANDO')}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Iniciar Entrega
              </button>
            )}
            {selectedComanda.estado === 'ENTREGANDO' && (
              <button
                onClick={() => {
                  if (confirm('¿Confirmar entrega al cliente?')) {
                    updateEstado(selectedComanda.id, 'ENTREGADO');
                    setScreen('dashboard');
                  }
                }}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirmar Entrega
              </button>
            )}
            <button
              onClick={() => setScreen('dashboard')}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
