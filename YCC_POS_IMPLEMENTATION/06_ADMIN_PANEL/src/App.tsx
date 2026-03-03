import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Settings,
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ChevronRight, Bell, Search, Menu, X, LogOut, Clock, AlertTriangle,
  Store, Utensils, ChefHat
} from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

type Page = 'dashboard' | 'sales' | 'products' | 'users' | 'reports' | 'settings';

const SIDEBAR_ITEMS: { id: Page; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Ventas', icon: ShoppingCart },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
  { id: 'settings', label: 'Configuracion', icon: Settings },
];

export const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos desde el API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [salesRes, productsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/sales`),
          fetch(`${import.meta.env.VITE_API_URL}/products`)
        ]);
        
        const salesData = await salesRes.json();
        const productsData = await productsRes.json();
        
        setSales(salesData);
        setProducts(productsData);
        console.log('✅ Datos cargados en Admin:', { sales: salesData.length, products: productsData.length });
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        setSales([]);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calcular estadísticas desde datos reales
  const stats = {
    totalSales: sales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0),
    salesCount: sales.length,
    avgTicket: sales.length > 0 ? sales.reduce((sum, s) => sum + parseFloat(s.total || 0), 0) / sales.length : 0,
    productsCount: products.length
  };

  // Top 5 productos más vendidos
  const topProducts = sales
    .flatMap(sale => sale.items || [])
    .reduce((acc: any, item: any) => {
      const existing = acc.find((p: any) => p.name === item.productName);
      if (existing) {
        existing.sold += item.quantity;
        existing.revenue += parseFloat(item.price) * item.quantity;
      } else {
        acc.push({
          name: item.productName,
          sold: item.quantity,
          revenue: parseFloat(item.price) * item.quantity
        });
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  // Ventas recientes (últimas 6)
  const recentSales = sales
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map(sale => ({
      folio: sale.folio,
      customer: sale.customerName || 'Cliente',
      total: parseFloat(sale.total),
      method: sale.paymentMethod === 'CASH' ? 'Efectivo' : sale.paymentMethod === 'CARD' ? 'Tarjeta' : 'Cuenta Socio',
      time: new Date(sale.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      status: sale.status
    }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0`}>
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
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_ITEMS.map(item => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => setPage(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
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
                  <div className="space-y-4">
                    {topProducts.length > 0 ? topProducts.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.sold} vendidos</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{fmt(p.revenue)}</span>
                      </div>
                    )) : (
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

              {/* System status + Quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-sm text-gray-600">API Gateway</span><span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Online</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Base de Datos</span><span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Online</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-gray-600">POS Terminal 1</span><span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Activo</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-gray-600">KDS Cocina</span><span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Activo</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Usuarios Online</span><span className="text-sm font-bold text-gray-900">8</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Alertas</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg"><AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-medium text-amber-800">Stock Bajo</p><p className="text-xs text-amber-600">12 productos por debajo del minimo</p></div></div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"><Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /><div><p className="text-sm font-medium text-blue-800">Cierre Pendiente</p><p className="text-xs text-blue-600">Terminal 3 sin cierre de caja</p></div></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Acciones Rapidas</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"><Package className="w-4 h-4" /> Nuevo Producto</button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"><Users className="w-4 h-4" /> Nuevo Usuario</button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"><BarChart3 className="w-4 h-4" /> Generar Reporte</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {page !== 'dashboard' && (
            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
              <Utensils className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-medium text-gray-500">Seccion: {SIDEBAR_ITEMS.find(i => i.id === page)?.label}</p>
              <p className="text-sm text-gray-400 mt-2">Modulo en desarrollo - Proximamente</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
