import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, LogOut, Clock, CheckCircle, Package, MapPin, Phone,
  Utensils, Truck, Home, AlertCircle, RefreshCw, ChevronRight,
  Bell, Check, X, ArrowLeft, Eye, UserCheck
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';

// ===================== TYPES =====================
interface Comanda {
  id: string;
  folio: string;
  cliente: string;
  mesa?: string;
  domicilio?: string;
  telefono?: string;
  tipo: 'MESA' | 'DOMICILIO' | 'LLEVAR';
  estado: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGANDO' | 'ENTREGADO' | 'CANCELADO';
  items: ComandaItem[];
  total: number;
  createdAt: string;
  tiempoEspera: number;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  asignadoA?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ComandaItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  notas?: string;
  estado: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'RECOGIDO' | 'ENTREGADO';
}

type Screen = 'login' | 'dashboard' | 'disponibles' | 'mis-comandas' | 'comanda-detail';

// ===================== HELPERS =====================
const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'PENDIENTE': return 'bg-yellow-500';
    case 'PREPARANDO': return 'bg-blue-500';
    case 'LISTO': return 'bg-green-500';
    case 'ENTREGANDO': return 'bg-purple-500';
    case 'ENTREGADO': return 'bg-gray-500';
    case 'CANCELADO': return 'bg-red-500';
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
export const MobileAppEnhanced: React.FC = () => {
  const { user, isAuthenticated, login, logout, loading: authLoading } = useAuth();
  const [screen, setScreen] = useState<Screen>('login');
  const [comandasDisponibles, setComandasDisponibles] = useState<Comanda[]>([]);
  const [misComandas, setMisComandas] = useState<Comanda[]>([]);
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auto-navegar al dashboard si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      setScreen('dashboard');
    }
  }, [isAuthenticated, user]);

  // Cargar comandas disponibles (sin asignar)
  const loadComandasDisponibles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const tipo = user.role === 'WAITER' ? 'MESA' : 'DOMICILIO';
      const response = await fetch(`http://localhost:3004/comandas/disponibles?tipo=${tipo}`);
      if (!response.ok) throw new Error('Error cargando comandas disponibles');
      
      const data = await response.json();
      setComandasDisponibles(data);
    } catch (error) {
      console.error('Error cargando comandas disponibles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar mis comandas asignadas
  const loadMisComandas = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3004/comandas/mis-asignadas/${user.id}`);
      if (!response.ok) throw new Error('Error cargando mis comandas');
      
      const data = await response.json();
      setMisComandas(data);
    } catch (error) {
      console.error('Error cargando mis comandas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Asignar comanda a mí
  const asignarComanda = async (comandaId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:3004/comandas/${comandaId}/asignar-mesero`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Error al asignar comanda');
        return;
      }
      
      // Recargar listas
      await Promise.all([loadComandasDisponibles(), loadMisComandas()]);
      alert('Comanda asignada exitosamente');
    } catch (error) {
      console.error('Error asignando comanda:', error);
      alert('Error al asignar comanda');
    }
  };

  // Confirmar entrega
  const confirmarEntrega = async (comandaId: string) => {
    if (!user) return;
    
    if (!confirm('¿Confirmar que has entregado esta comanda?')) return;
    
    try {
      const response = await fetch(`http://localhost:3004/comandas/${comandaId}/confirmar-entrega`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Error al confirmar entrega');
        return;
      }
      
      // Recargar mis comandas
      await loadMisComandas();
      setSelectedComanda(null);
      setScreen('dashboard');
      alert('Entrega confirmada exitosamente');
    } catch (error) {
      console.error('Error confirmando entrega:', error);
      alert('Error al confirmar entrega');
    }
  };

  // Cancelar comanda
  const cancelarComanda = async (comandaId: string) => {
    if (!user) return;
    
    const motivo = prompt('Motivo de cancelación:');
    if (!motivo) return;
    
    try {
      const response = await fetch(`http://localhost:3004/comandas/${comandaId}/cancelar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo, userId: user.id })
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Error al cancelar comanda');
        return;
      }
      
      await loadMisComandas();
      setSelectedComanda(null);
      setScreen('dashboard');
      alert('Comanda cancelada');
    } catch (error) {
      console.error('Error cancelando comanda:', error);
      alert('Error al cancelar comanda');
    }
  };

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    if (screen === 'disponibles') {
      loadComandasDisponibles();
      const interval = setInterval(loadComandasDisponibles, 10000);
      return () => clearInterval(interval);
    } else if (screen === 'mis-comandas') {
      loadMisComandas();
      const interval = setInterval(loadMisComandas, 10000);
      return () => clearInterval(interval);
    }
  }, [screen, user]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      setScreen('dashboard');
    } else {
      alert(result.error || 'Error al iniciar sesión');
    }
  };

  // ===================== PANTALLA LOGIN =====================
  if (!isAuthenticated || screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">YCC POS</h1>
            <p className="text-gray-600 mt-2">Meseros & Delivery</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email o Usuario
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {authLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Demo: mesero@ycc.com / password123</p>
            <p>delivery@ycc.com / password123</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===================== PANTALLA DASHBOARD =====================
  if (screen === 'dashboard') {
    const isMesero = user?.role === 'WAITER';
    
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMesero ? <Utensils className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
              <div>
                <h1 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h1>
                <p className="text-sm opacity-90">{isMesero ? 'Mesero' : 'Delivery'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="p-4 space-y-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen('disponibles')}
            className="w-full bg-white rounded-xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Pedidos Disponibles</h3>
                <p className="text-sm text-gray-600">Listos para recoger</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen('mis-comandas')}
            className="w-full bg-white rounded-xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Mis Pedidos</h3>
                <p className="text-sm text-gray-600">Asignados a mí</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.button>
        </div>
      </div>
    );
  }

  // ===================== PANTALLA DISPONIBLES =====================
  if (screen === 'disponibles') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setScreen('dashboard')} className="p-1">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Pedidos Disponibles</h1>
                <p className="text-sm opacity-90">Listos para entregar</p>
              </div>
            </div>
            <button onClick={loadComandasDisponibles} className="p-2 hover:bg-white/20 rounded-lg">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Lista de comandas */}
        <div className="p-4 space-y-3">
          {comandasDisponibles.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay pedidos disponibles</p>
            </div>
          ) : (
            comandasDisponibles.map((comanda) => (
              <motion.div
                key={comanda.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{comanda.folio}</h3>
                    <p className="text-gray-600">{comanda.cliente}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(comanda.estado)} text-white`}>
                    {comanda.estado}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {comanda.mesa && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Home className="w-4 h-4" />
                      <span>Mesa {comanda.mesa}</span>
                    </div>
                  )}
                  {comanda.domicilio && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{comanda.domicilio}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{comanda.tiempoEspera} min esperando</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="font-bold text-lg text-blue-600">{fmt(comanda.total)}</span>
                  <button
                    onClick={() => asignarComanda(comanda.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Tomar Pedido
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ===================== PANTALLA MIS COMANDAS =====================
  if (screen === 'mis-comandas') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setScreen('dashboard')} className="p-1">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Mis Pedidos</h1>
                <p className="text-sm opacity-90">{misComandas.length} asignados</p>
              </div>
            </div>
            <button onClick={loadMisComandas} className="p-2 hover:bg-white/20 rounded-lg">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Lista de mis comandas */}
        <div className="p-4 space-y-3">
          {misComandas.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tienes pedidos asignados</p>
            </div>
          ) : (
            misComandas.map((comanda) => (
              <motion.div
                key={comanda.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  setSelectedComanda(comanda);
                  setScreen('comanda-detail');
                }}
                className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{comanda.folio}</h3>
                    <p className="text-gray-600">{comanda.cliente}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(comanda.estado)} text-white`}>
                    {comanda.estado}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {comanda.mesa && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Home className="w-4 h-4" />
                      <span>Mesa {comanda.mesa}</span>
                    </div>
                  )}
                  {comanda.domicilio && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{comanda.domicilio}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="font-bold text-lg text-blue-600">{fmt(comanda.total)}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ===================== PANTALLA DETALLE COMANDA =====================
  if (screen === 'comanda-detail' && selectedComanda) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen('mis-comandas')} className="p-1">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{selectedComanda.folio}</h1>
              <p className="text-sm opacity-90">{selectedComanda.cliente}</p>
            </div>
          </div>
        </div>

        {/* Detalle */}
        <div className="p-4 space-y-4">
          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(selectedComanda.estado)} text-white`}>
                  {selectedComanda.estado}
                </span>
              </div>
              {selectedComanda.mesa && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mesa:</span>
                  <span className="font-semibold">{selectedComanda.mesa}</span>
                </div>
              )}
              {selectedComanda.domicilio && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Domicilio:</span>
                  <span className="font-semibold text-right">{selectedComanda.domicilio}</span>
                </div>
              )}
              {selectedComanda.telefono && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Teléfono:</span>
                  <span className="font-semibold">{selectedComanda.telefono}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-bold text-lg mb-3">Productos</h3>
            <div className="space-y-2">
              {selectedComanda.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold">{item.nombre}</p>
                    {item.notas && <p className="text-sm text-gray-600">{item.notas}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">x{item.cantidad}</p>
                    <p className="text-sm text-gray-600">{fmt(item.precio)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 mt-3 border-t flex items-center justify-between">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-2xl text-blue-600">{fmt(selectedComanda.total)}</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-3">
            {selectedComanda.estado === 'ENTREGANDO' && (
              <button
                onClick={() => confirmarEntrega(selectedComanda.id)}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-6 h-6" />
                Confirmar Entrega
              </button>
            )}
            
            {selectedComanda.estado !== 'ENTREGADO' && selectedComanda.estado !== 'CANCELADO' && (
              <button
                onClick={() => cancelarComanda(selectedComanda.id)}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-6 h-6" />
                Cancelar Pedido
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
