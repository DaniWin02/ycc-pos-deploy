import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Utensils, Clock, CheckCircle, XCircle, AlertCircle, Plus, Search,
  Filter, Calendar, User, DollarSign, TrendingUp, TrendingDown,
  ChefHat, Truck, Home, Store, Phone, Mail, MapPin, Edit,
  Eye, Download, RefreshCw, BarChart3
} from 'lucide-react';

interface Comanda {
  id: string;
  folio: string;
  cliente: string;
  mesa?: string;
  domicilio?: string;
  telefono?: string;
  tipo: 'MESA' | 'DOMICILIO' | 'LLEVAR';
  estado: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
  items: ComandaItem[];
  total: number;
  fecha: string;
  hora: string;
  tiempoEspera: number;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  notas?: string;
  mesero?: string;
  delivery?: string;
}

interface ComandaItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  notas?: string;
  estado: 'PENDIENTE' | 'PREPARANDO' | 'LISTO';
}

const ComandasPage: React.FC = () => {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Cargar datos desde el API
  useEffect(() => {
    const loadComandas = async () => {
      setLoading(true);
      try {
        const timestamp = Date.now();
        const response = await fetch(`http://localhost:3004/comandas?t=${timestamp}`);
        
        if (!response.ok) {
          throw new Error('Error cargando comandas');
        }
        
        const data = await response.json();
        setComandas(data);
      } catch (error) {
        console.error('Error cargando comandas:', error);
        // En caso de error, mostrar mensaje o dejar array vacío
        setComandas([]);
      } finally {
        setLoading(false);
      }
    };

    loadComandas();
    
    // Recargar cada 30 segundos para datos en tiempo real
    const interval = setInterval(loadComandas, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Función para recargar datos manualmente
  const refreshData = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const response = await fetch(`http://localhost:3004/comandas?t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error('Error cargando comandas');
      }
      
      const data = await response.json();
      setComandas(data);
    } catch (error) {
      console.error('Error recargando comandas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear comanda de prueba
  const createTestComanda = async () => {
    try {
      const testComanda = {
        cliente: 'Cliente de Prueba',
        mesa: 'Mesa 1',
        tipo: 'MESA',
        prioridad: 'MEDIA',
        items: [
          { nombre: 'Hamburguesa Clásica', cantidad: 1, precio: 120 },
          { nombre: 'Refresco', cantidad: 1, precio: 25 }
        ],
        mesero: 'Mesero Test'
      };

      const response = await fetch('http://localhost:3004/comandas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testComanda)
      });

      if (!response.ok) {
        throw new Error('Error creando comanda de prueba');
      }

      const result = await response.json();
      console.log('Comanda de prueba creada:', result);
      
      // Recargar datos para mostrar la nueva comanda
      refreshData();
    } catch (error) {
      console.error('Error creando comanda de prueba:', error);
      alert('Error creando comanda de prueba');
    }
  };

  // Filtrar comandas
  const filteredComandas = comandas.filter(comanda => {
    const matchesSearch = comanda.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comanda.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (comanda.mesa && comanda.mesa.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEstado = filterEstado === 'TODOS' || comanda.estado === filterEstado;
    const matchesTipo = filterTipo === 'TODOS' || comanda.tipo === filterTipo;

    return matchesSearch && matchesEstado && matchesTipo;
  });

  // Obtener color según estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'PREPARANDO': return 'bg-blue-100 text-blue-800';
      case 'LISTO': return 'bg-green-100 text-green-800';
      case 'ENTREGADO': return 'bg-gray-100 text-gray-800';
      case 'CANCELADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono según tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'MESA': return <Store className="w-4 h-4" />;
      case 'DOMICILIO': return <Home className="w-4 h-4" />;
      case 'LLEVAR': return <Truck className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  // Obtener color de prioridad
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'BAJA': return 'bg-gray-100 text-gray-600';
      case 'MEDIA': return 'bg-blue-100 text-blue-600';
      case 'ALTA': return 'bg-orange-100 text-orange-600';
      case 'URGENTE': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Estadísticas
  const stats = {
    total: comandas.length,
    pendientes: comandas.filter(c => c.estado === 'PENDIENTE').length,
    preparando: comandas.filter(c => c.estado === 'PREPARANDO').length,
    listos: comandas.filter(c => c.estado === 'LISTO').length,
    entregados: comandas.filter(c => c.estado === 'ENTREGADO').length,
    cancelados: comandas.filter(c => c.estado === 'CANCELADO').length,
    totalVentas: comandas.reduce((sum, c) => sum + c.total, 0)
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Utensils className="w-8 h-8 text-indigo-600" />
            Gestión de Comandas
          </h1>
          <p className="text-gray-600 mt-1">Control y seguimiento de órdenes en tiempo real</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={createTestComanda}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Comanda (Test)
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Preparando</p>
              <p className="text-2xl font-bold text-blue-600">{stats.preparando}</p>
            </div>
            <ChefHat className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Listos</p>
              <p className="text-2xl font-bold text-green-600">{stats.listos}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entregados</p>
              <p className="text-2xl font-bold text-gray-600">{stats.entregados}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelados</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-100">Ventas</p>
              <p className="text-2xl font-bold">${stats.totalVentas}</p>
            </div>
            <DollarSign className="w-8 h-8 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por folio, cliente o mesa..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="PREPARANDO">Preparando</option>
            <option value="LISTO">Listos</option>
            <option value="ENTREGADO">Entregados</option>
            <option value="CANCELADO">Cancelados</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="MESA">Mesa</option>
            <option value="DOMICILIO">Domicilio</option>
            <option value="LLEVAR">Para llevar</option>
          </select>

          <button 
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Comandas Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredComandas.length > 0 ? (
                filteredComandas.map((comanda) => (
                  <motion.tr
                    key={comanda.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{comanda.folio}</span>
                        {comanda.notas && (
                          <AlertCircle className="w-4 h-4 text-amber-500" title={comanda.notas} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{comanda.cliente}</p>
                        {comanda.mesa && (
                          <p className="text-xs text-gray-500">{comanda.mesa}</p>
                        )}
                        {comanda.telefono && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {comanda.telefono}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTipoIcon(comanda.tipo)}
                        <span className="text-sm text-gray-900">{comanda.tipo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(comanda.estado)}`}>
                        {comanda.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPrioridadColor(comanda.prioridad)}`}>
                        {comanda.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">${comanda.total}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{comanda.tiempoEspera} min</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedComanda(comanda);
                            setShowDetails(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                    No se encontraron comandas con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetails && selectedComanda && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detalles de Comanda</h2>
                  <p className="text-gray-600 mt-1">Folio: {selectedComanda.folio}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Información del Cliente</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedComanda.cliente}</span>
                      </div>
                      {selectedComanda.mesa && (
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedComanda.mesa}</span>
                        </div>
                      )}
                      {selectedComanda.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedComanda.telefono}</span>
                        </div>
                      )}
                      {selectedComanda.domicilio && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedComanda.domicilio}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Información de la Comanda</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getTipoIcon(selectedComanda.tipo)}
                        <span className="text-sm text-gray-900">{selectedComanda.tipo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{selectedComanda.fecha} {selectedComanda.hora}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPrioridadColor(selectedComanda.prioridad)}`}>
                          {selectedComanda.prioridad}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(selectedComanda.estado)}`}>
                          {selectedComanda.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedComanda.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.nombre}</p>
                              {item.notas && (
                                <p className="text-xs text-gray-500">{item.notas}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-gray-900">{item.cantidad}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm text-gray-900">${item.precio}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-gray-900">${item.cantidad * item.precio}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-900">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-lg text-gray-900">
                          ${selectedComanda.total}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedComanda.notas && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Notas Adicionales</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedComanda.notas}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Edit className="w-4 h-4 inline mr-2" />
                  Editar Comanda
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export { ComandasPage };
