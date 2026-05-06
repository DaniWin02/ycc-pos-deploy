import React, { useState, useEffect, Component, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings,
  DollarSign, TrendingUp,
  ChevronRight, Bell, Search, Menu, Clock, AlertTriangle, CheckCircle,
  Store, FolderOpen, Utensils, Warehouse, Hash, Palette, Monitor,
  Shield
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SalesPage } from './pages/SalesPage';
import { ComandasPage } from './pages/ComandasPage';
import { UsersPage } from './pages/UsersPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import InventoryPage from './pages/InventoryPage';
import { FoliosPage } from './pages/FoliosPage';
import { CustomersPage } from './pages/CustomersPage';
import { AppearancePage } from './pages/AppearancePage';
import { KDSConfigPage } from './pages/KDSConfigPage';
import { SaleListItem, SaleItem, ProductListItem, TopProduct } from './types/api.types';

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: string}> {
  state = { hasError: false, error: '' };
  static getDerivedStateFromError(error: any) { return { hasError: true, error: error?.message || 'Error desconocido' }; }
  render() {
    if (this.state.hasError) return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error en Admin Panel</h2>
          <p className="text-sm text-gray-600 mb-4">{this.state.error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Recargar</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

type Page = 'dashboard' | 'sales' | 'comandas' | 'folios' | 'products' | 'categories' | 'inventory' | 'customers' | 'users' | 'reports' | 'settings' | 'appearance';

const SIDEBAR_ITEMS: { id: Page; label: string; icon: React.ComponentType<{ className?: string }>; section?: string }[] = [
  // 📊 OPERACIONES
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Operaciones' },
  { id: 'sales', label: 'Ventas', icon: ShoppingCart, section: 'Operaciones' },
  { id: 'comandas', label: 'Comandas', icon: Utensils, section: 'Operaciones' },
  { id: 'folios', label: 'Folios', icon: Hash, section: 'Operaciones' },
  
  // 📦 CATÁLOGO
  { id: 'products', label: 'Productos', icon: Package, section: 'Catálogo' },
  { id: 'categories', label: 'Categorías', icon: FolderOpen, section: 'Catálogo' },
  { id: 'inventory', label: 'Inventario', icon: Warehouse, section: 'Catálogo' },
  
  // 👥 CLIENTES
  { id: 'customers', label: 'Clientes', icon: Users, section: 'Clientes' },
  
  // � USUARIOS
  { id: 'users', label: 'Usuarios', icon: Shield, section: 'Usuarios' },
  
  // �📈 REPORTES
  { id: 'reports', label: 'Reportes', icon: BarChart3, section: 'Reportes' },
  
  // ⚙️ CONFIGURACIÓN
  { id: 'settings', label: 'Configuración', icon: Settings, section: 'Configuración' },
  { id: 'appearance', label: 'Apariencia', icon: Palette, section: 'Configuración' },
];

export const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sales, setSales] = useState<SaleListItem[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const socketRef = useRef<Socket | null>(null);
  
  // Estado para alertas dinámicas en tiempo real
  const [dashboardAlerts, setDashboardAlerts] = useState<{
    lowStock: { count: number; items: any[] };
    pendingClosures: { count: number; terminals: string[] };
    systemStatus: {
      apiGateway: boolean;
      database: boolean;
      posTerminals: { id: string; name: string; active: boolean }[];
      kds: boolean;
      onlineUsers: number;
    };
  }>({
    lowStock: { count: 0, items: [] },
    pendingClosures: { count: 0, terminals: [] },
    systemStatus: {
      apiGateway: true,
      database: true,
      posTerminals: [
        { id: '1', name: 'Terminal 1', active: true },
        { id: '2', name: 'Terminal 2', active: false },
        { id: '3', name: 'Terminal 3', active: false }
      ],
      kds: true,
      onlineUsers: 0
    }
  });

  // Cargar datos desde el API
  useEffect(() => {
    const loadData = async () => {
      try {
        const timestamp = Date.now();
        const [salesRes, productsRes] = await Promise.all([
          fetch(`http://localhost:3004/api/sales?t=${timestamp}`),
          fetch(`http://localhost:3004/api/products?t=${timestamp}`)
        ]);
        
        const salesData = await salesRes.json();
        const productsData = await productsRes.json();
        
        // Mapear datos de ventas
        const mappedSales = (salesData || []).map((sale: any) => ({
          ...sale,
          total: Number(sale.totalAmount || sale.total || 0) || 0,
          subtotal: Number(sale.subtotal || 0) || 0,
          tax: Number(sale.taxAmount || sale.tax || 0) || 0,
          paymentMethod: sale.paymentMethod || sale.payments?.[0]?.method || 'N/A'
        }));
        
        setSales(mappedSales);
        setProducts(productsData);
        console.log('✅ Datos cargados en Admin:', { sales: mappedSales.length, products: productsData.length });
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Función para cargar alertas del dashboard
  const loadDashboardAlerts = async () => {
    try {
      // Cargar productos con stock bajo
      const productsRes = await fetch('http://localhost:3004/api/products');
      const productsData = await productsRes.json();
      
      const lowStockItems = (productsData || []).filter((p: any) => 
        p.stock !== undefined && p.minStock !== undefined && p.stock <= p.minStock
      );
      
      // Cargar estadísticas de actividad de usuarios
      const activityRes = await fetch('http://localhost:3004/api/auth/activity/stats');
      const activityData = await activityRes.json().catch(() => ({ onlineUsers: 0 }));
      
      setDashboardAlerts(prev => ({
        ...prev,
        lowStock: {
          count: lowStockItems.length,
          items: lowStockItems
        },
        systemStatus: {
          ...prev.systemStatus,
          apiGateway: true,
          database: true,
          onlineUsers: activityData.onlineUsers || 0
        }
      }));
      
      console.log('📊 Alertas del dashboard actualizadas:', {
        lowStock: lowStockItems.length,
        onlineUsers: activityData.onlineUsers
      });
    } catch (error) {
      console.error('Error cargando alertas:', error);
    }
  };
  
  // Cargar alertas inicialmente y cada 30 segundos
  useEffect(() => {
    loadDashboardAlerts();
    const interval = setInterval(loadDashboardAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Conectar a Socket.io para sincronización en tiempo real
  useEffect(() => {
    const socket = io('http://localhost:3004', {
      transports: ['polling', 'websocket'], // Polling primero para evitar warnings
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    socketRef.current = socket;
    
    // Heartbeat interval ref
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    
    socket.on('connect', () => {
      console.log('🔌 Admin Panel conectado a Socket.io');
      setConnectionStatus('connected');
      
      // Reportar actividad de administrador al conectar
      socket.emit('user:login', {
        userId: 'admin-panel',
        username: 'Admin Panel',
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: 'ADMIN',
        module: 'ADMIN'
      });
      console.log('📡 Actividad de Admin Panel reportada');
      
      // Enviar heartbeat cada 30 segundos para mantener estado online
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        socket.emit('user:heartbeat', { userId: 'admin-panel' });
        console.log('💓 Admin Panel heartbeat enviado');
      }, 30000);
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 Admin Panel desconectado de Socket.io');
      setConnectionStatus('disconnected');
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    });
    
    socket.on('reconnecting', () => {
      console.log('🔄 Admin Panel reconectando...');
      setConnectionStatus('reconnecting');
    });
    
    // Escuchar actualizaciones de alertas en tiempo real
    socket.on('alert:new', (alert: any) => {
      console.log('🔔 Nueva alerta recibida:', alert);
      // Recargar alertas del dashboard
      loadDashboardAlerts();
    });
    
    // Escuchar actualizaciones de actividad de usuarios
    socket.on('user:activity:updated', (data: any) => {
      console.log('📊 Actividad de usuarios actualizada:', data);
      if (data && typeof data.online === 'number') {
        setDashboardAlerts(prev => ({
          ...prev,
          systemStatus: {
            ...prev.systemStatus,
            onlineUsers: data.online || 0
          }
        }));
      }
    });
    
    // Escuchar nuevas ventas creadas
    socket.on('sale:created', (data: any) => {
      console.log('📥 Nueva venta recibida:', data);
      // Recargar ventas para obtener la nueva
      fetch('http://localhost:3004/api/sales?t=' + Date.now())
        .then(res => res.json())
        .then(salesData => {
          const mappedSales = (salesData || []).map((sale: any) => ({
            ...sale,
            total: Number(sale.totalAmount || sale.total || 0) || 0,
            subtotal: Number(sale.subtotal || 0) || 0,
            tax: Number(sale.taxAmount || sale.tax || 0) || 0,
            paymentMethod: sale.paymentMethod || sale.payments?.[0]?.method || 'N/A'
          }));
          setSales(mappedSales);
          console.log('✅ Ventas actualizadas tras nueva venta');
        })
        .catch(err => console.error('Error recargando ventas:', err));
    });
    
    // Escuchar actualizaciones de ventas
    socket.on('sale:updated', (data: any) => {
      console.log('🔄 Venta actualizada recibida:', data);
      // Actualizar la venta específica en el estado
      setSales(prevSales => {
        const updatedSales = prevSales.map(sale => {
          if (sale.id === data.orderId) {
            return {
              ...sale,
              status: data.status,
              total: Number(data.totalAmount || sale.total || 0),
              updatedAt: data.updatedAt
            };
          }
          return sale;
        });
        return updatedSales;
      });
      console.log('✅ Estado de ventas actualizado');
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);

  // Calcular estadísticas desde datos reales
  const stats = {
    totalSales: sales.reduce((sum, s) => sum + (Number(s.total || s.totalAmount || 0)), 0),
    salesCount: sales.length,
    avgTicket: sales.length > 0 ? (sales.reduce((sum, s) => sum + (Number(s.total || s.totalAmount || 0)), 0) / sales.length) : 0,
    productsCount: products.length
  };

  // Top 5 productos más vendidos
  const topProducts = sales
    .flatMap(sale => {
      // Manejar diferentes estructuras de datos de items
      const items = sale.items || sale.saleItems || [];
      return (items || []).map((item: any) => ({
        name: item.productName || item.name || 'Producto desconocido',
        quantity: parseInt(String(item.quantity)) || 0,
        price: parseFloat(String(item.price || item.unitPrice || item.totalPrice)) || 0
      }));
    })
    .filter(item => item.quantity > 0 && item.price > 0) // Filtrar items inválidos
    .reduce((acc: TopProduct[], item) => {
      const existing = acc.find((p: TopProduct) => p.name === item.name);
      if (existing) {
        existing.sold += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        acc.push({
          name: item.name,
          sold: item.quantity,
          revenue: item.price * item.quantity
        });
      }
      return acc;
    }, []);

  console.log('🔍 Debug - Top products calculados:', topProducts);

  // Ventas recientes (últimas 6)
  const recentSales = sales
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((sale: SaleListItem) => ({
      folio: sale.folio,
      customer: sale.customerName || 'Cliente',
      total: Number(sale.total || sale.totalAmount || 0),
      method: sale.paymentMethod === 'CASH' ? 'Efectivo' : sale.paymentMethod === 'CARD' ? 'Tarjeta' : 'Cuenta Socio',
      time: new Date(sale.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      status: sale.status
    }));

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 sticky top-0 h-screen overflow-hidden`}>
        <div className="h-16 border-b border-gray-200 flex items-center px-4 gap-3">
          {sidebarOpen && (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm leading-tight">YCC Admin</h1>
                <p className="text-xs text-gray-400">Country Club</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {(() => {
            const sections = [...new Set(SIDEBAR_ITEMS.map(i => i.section))];
            return sections.map((section, sectionIndex) => (
              <div key={section} className={`${sectionIndex > 0 ? 'mt-4 pt-3 border-t border-gray-200' : ''}`}>
                {sidebarOpen && (
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section}
                  </h3>
                )}
                <div className="space-y-1">
                  {SIDEBAR_ITEMS.filter(item => item.section === section).map(item => {
                    const Icon = item.icon;
                    const active = page === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setPage(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                        {sidebarOpen && <span>{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <div className={`flex items-center gap-3 px-3 py-2 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">A</div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                <p className="text-xs text-gray-400">Supervisor</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 capitalize">{page === 'dashboard' ? 'Dashboard' : SIDEBAR_ITEMS.find(i => i.id === page)?.label}</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Socket.io Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100" title={`Socket.io: ${connectionStatus}`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'reconnecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              }`} />
              <span className="text-xs text-gray-500 hidden sm:inline">
                {connectionStatus === 'connected' ? 'En vivo' :
                 connectionStatus === 'reconnecting' ? 'Reconectando...' :
                 'Desconectado'}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-400">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {page === 'dashboard' && (
            <div className="space-y-6">
              {/* PRIORITY 1: Alerts - At the top - EN TIEMPO REAL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Alertas en Tiempo Real</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-xs font-medium text-gray-500">
                        {dashboardAlerts.lowStock.count > 0 || dashboardAlerts.pendingClosures.count > 0 ? (
                          <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            {dashboardAlerts.lowStock.count + dashboardAlerts.pendingClosures.count} pendientes
                          </span>
                        ) : (
                          <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">Sin alertas</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {/* CRITICAL - Stock Bajo - Dato real */}
                    {dashboardAlerts.lowStock.count > 0 ? (
                      <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-red-800">Stock Bajo</p>
                            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">CRÍTICO</span>
                          </div>
                          <p className="text-xs text-red-600 mt-1">
                            {dashboardAlerts.lowStock.count} producto{dashboardAlerts.lowStock.count !== 1 ? 's' : ''} por debajo del mínimo de inventario
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-800">Inventario OK</p>
                          <p className="text-xs text-green-600 mt-1">Todos los productos tienen stock suficiente</p>
                        </div>
                      </div>
                    )}
                    
                    {/* MEDIUM - Cierre Pendiente - Dato real */}
                    {dashboardAlerts.pendingClosures.count > 0 ? (
                      <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-amber-800">Cierre Pendiente</p>
                            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">MEDIO</span>
                          </div>
                          <p className="text-xs text-amber-600 mt-1">
                            {dashboardAlerts.pendingClosures.terminals.join(', ')} sin cierre de caja
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-800">Cierres al día</p>
                          <p className="text-xs text-blue-600 mt-1">Todas las terminales han cerrado caja</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* System Status - EN TIEMPO REAL */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">API Gateway</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dashboardAlerts.systemStatus.apiGateway ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'}`}>
                        {dashboardAlerts.systemStatus.apiGateway ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base de Datos</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dashboardAlerts.systemStatus.database ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'}`}>
                        {dashboardAlerts.systemStatus.database ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {dashboardAlerts.systemStatus.posTerminals.map(terminal => (
                      <div key={terminal.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{terminal.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${terminal.active ? 'text-emerald-600 bg-emerald-100' : 'text-gray-500 bg-gray-100'}`}>
                          {terminal.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">KDS Cocina</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dashboardAlerts.systemStatus.kds ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'}`}>
                        {dashboardAlerts.systemStatus.kds ? 'Activo' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Usuarios Online</span>
                      <span className="text-sm font-bold text-gray-900">{dashboardAlerts.systemStatus.onlineUsers}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{fmt(stats.totalSales)}</p>
                  <p className="text-sm text-gray-500 mt-1">Ventas Totales</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.salesCount}</p>
                  <p className="text-sm text-gray-500 mt-1">Órdenes</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{fmt(stats.avgTicket)}</p>
                  <p className="text-sm text-gray-500 mt-1">Ticket Promedio</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.productsCount}</p>
                  <p className="text-sm text-gray-500 mt-1">Productos</p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales info */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-6">Resumen de Ventas</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Total de Ventas</p>
                        <p className="text-2xl font-bold text-gray-900">{fmt(stats.totalSales)}</p>
                      </div>
                      <DollarSign className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Número de Órdenes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.salesCount}</p>
                      </div>
                      <ShoppingCart className="w-10 h-10 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Ticket Promedio</p>
                        <p className="text-2xl font-bold text-gray-900">{fmt(stats.avgTicket)}</p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Top products */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Top Productos</h3>
                  <div className="space-y-3">
                    {topProducts.length > 0 ? topProducts.map((p: TopProduct, i: number) => {
                      // Validación adicional para evitar NaN
                      const sold = p.sold || 0;
                      const revenue = p.revenue || 0;
                      const pricePerUnit = sold > 0 ? revenue / sold : 0;
                      
                      return (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{sold} vendidos</span>
                                <span>•</span>
                                <span>{fmt(pricePerUnit)} c/u</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{fmt(revenue)}</p>
                            <p className="text-xs text-gray-500">ingresos</p>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-sm text-gray-400 text-center py-8">No hay datos de ventas</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent sales */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Ventas Recientes</h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">Ver todas <ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-6 py-3 text-left">Folio</th>
                        <th className="px-6 py-3 text-left">Cliente</th>
                        <th className="px-6 py-3 text-left">Total</th>
                        <th className="px-6 py-3 text-left">Metodo</th>
                        <th className="px-6 py-3 text-left">Hora</th>
                        <th className="px-6 py-3 text-left">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentSales.length > 0 ? recentSales.map((sale: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.folio}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{sale.customer}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{fmt(sale.total)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{sale.method}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{sale.time}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                              {sale.status === 'COMPLETED' ? 'Completada' : sale.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                            No hay ventas registradas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {page === 'sales' && <SalesPage />}
          {page === 'folios' && <FoliosPage />}
          {page === 'products' && <ProductsPage />}
          {page === 'categories' && <CategoriesPage />}
          {page === 'inventory' && <InventoryPage />}
          {page === 'comandas' && <ComandasPage />}
          {page === 'customers' && <CustomersPage />}
          {page === 'users' && <UsersPage />}
          {page === 'reports' && <ReportsPage />}
          {page === 'settings' && <SettingsPage />}
          {page === 'appearance' && <AppearancePage />}
        </main>
      </div>
    </div>
    </ErrorBoundary>
  );
};
