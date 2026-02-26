import React, { useState } from 'react';
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

const STATS = [
  { label: 'Ventas Hoy', value: 28450, change: 12.5, positive: true, icon: DollarSign, color: 'emerald' },
  { label: 'Ordenes Hoy', value: 47, change: 8.2, positive: true, icon: ShoppingCart, color: 'blue' },
  { label: 'Ticket Promedio', value: 605, change: -2.3, positive: false, icon: TrendingUp, color: 'purple' },
  { label: 'Clientes Activos', value: 312, change: 5.1, positive: true, icon: Users, color: 'amber' },
];

const RECENT_SALES = [
  { folio: 'V-0047', customer: 'Juan Perez', total: 485, method: 'Efectivo', time: '14:32', status: 'completed' },
  { folio: 'V-0046', customer: 'Maria Garcia', total: 1250, method: 'Tarjeta', time: '14:15', status: 'completed' },
  { folio: 'V-0045', customer: 'Carlos Lopez', total: 320, method: 'Cuenta Socio', time: '13:58', status: 'completed' },
  { folio: 'V-0044', customer: 'Ana Martinez', total: 675, method: 'Efectivo', time: '13:42', status: 'completed' },
  { folio: 'V-0043', customer: 'Roberto Diaz', total: 890, method: 'Tarjeta', time: '13:25', status: 'refunded' },
  { folio: 'V-0042', customer: 'Laura Sanchez', total: 410, method: 'Efectivo', time: '13:10', status: 'completed' },
];

const TOP_PRODUCTS = [
  { name: 'Hamburguesa Clasica', sold: 45, revenue: 6525 },
  { name: 'Coca Cola 600ml', sold: 68, revenue: 2380 },
  { name: 'Club Sandwich', sold: 32, revenue: 4000 },
  { name: 'Cerveza Artesanal', sold: 28, revenue: 2380 },
  { name: 'Ensalada Cesar', sold: 24, revenue: 2640 },
];

const WEEKLY_SALES = [
  { day: 'Lun', amount: 18500 },
  { day: 'Mar', amount: 22300 },
  { day: 'Mie', amount: 19800 },
  { day: 'Jue', amount: 25100 },
  { day: 'Vie', amount: 31200 },
  { day: 'Sab', amount: 28450 },
  { day: 'Dom', amount: 15600 },
];

export const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const maxSale = Math.max(...WEEKLY_SALES.map(s => s.amount));

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
                {STATS.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}-100`}>
                          <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-semibold ${stat.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(stat.change)}%
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.label.includes('Ventas') || stat.label.includes('Ticket') ? fmt(stat.value) : stat.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-6">Ventas de la Semana</h3>
                  <div className="flex items-end gap-3 h-48">
                    {WEEKLY_SALES.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">{fmt(d.amount)}</span>
                        <div className="w-full rounded-t-lg bg-indigo-500 transition-all hover:bg-indigo-600" style={{ height: `${(d.amount / maxSale) * 100}%` }} />
                        <span className="text-xs text-gray-400 font-medium">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top products */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Top Productos</h3>
                  <div className="space-y-4">
                    {TOP_PRODUCTS.map((p, i) => (
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
                    ))}
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
                      {RECENT_SALES.map((sale, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.folio}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{sale.customer}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{fmt(sale.total)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{sale.method}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{sale.time}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sale.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {sale.status === 'completed' ? 'Completada' : 'Reembolso'}
                            </span>
                          </td>
                        </tr>
                      ))}
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
