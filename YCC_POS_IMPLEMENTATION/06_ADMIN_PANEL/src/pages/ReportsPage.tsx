import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Download, Calendar } from 'lucide-react';
import { API_URL } from '../lib/config';

interface SalesData {
  date: string;
  total: number;
  count: number;
}

interface ProductSales {
  productName: string;
  quantity: number;
  revenue: number;
}

export const ReportsPage: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      const response = await fetch(`${API_URL}/sales?t=${Date.now()}`);
      const data = await response.json();
      // Mapear datos del API con validación robusta
      const mappedSales = data.map((sale: any) => ({
        ...sale,
        total: Number(sale.totalAmount || sale.total || 0) || 0,
        subtotal: Number(sale.subtotal || 0) || 0,
        tax: Number(sale.taxAmount || sale.tax || 0) || 0,
        paymentMethod: sale.payments?.[0]?.method || 'N/A'
      }));
      setSales(mappedSales);
      console.log('✅ Datos de reportes cargados:', mappedSales.length);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = (sale: any) => {
    const saleDate = new Date(sale.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateRange === 'today') {
      return saleDate >= today;
    } else if (dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo;
    } else if (dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return saleDate >= monthAgo;
    } else if (dateRange === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return saleDate >= yearAgo;
    }
    return true;
  };

  const filteredSales = sales.filter(filterByDateRange);

  // Calcular métricas
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const totalOrders = filteredSales.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Ventas por día
  const salesByDay: { [key: string]: SalesData } = {};
  filteredSales.forEach(sale => {
    const date = new Date(sale.createdAt).toLocaleDateString('es-MX');
    if (!salesByDay[date]) {
      salesByDay[date] = { date, total: 0, count: 0 };
    }
    salesByDay[date].total += Number(sale.total);
    salesByDay[date].count += 1;
  });

  const dailySales = Object.values(salesByDay).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Productos más vendidos
  const productSales: { [key: string]: ProductSales } = {};
  filteredSales.forEach(sale => {
    // Manejar diferentes estructuras de datos de items
    const items = sale.items || sale.saleItems || [];
    items.forEach((item: any) => {
      const productName = item.productName || item.name || 'Producto desconocido';
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.price) || parseFloat(item.unitPrice) || 0;
      
      if (!productSales[productName]) {
        productSales[productName] = {
          productName,
          quantity: 0,
          revenue: 0
        };
      }
      
      // Calcular ingresos correctamente: precio unitario * cantidad
      const itemRevenue = unitPrice * quantity;
      productSales[productName].quantity += quantity;
      productSales[productName].revenue += itemRevenue;
    });
  });

  console.log('🔍 Debug - Productos calculados en reportes:', productSales);

  const topProducts = Object.values(productSales)
    .filter(product => product.quantity > 0 && product.revenue > 0) // Filtrar productos inválidos
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Ventas por método de pago
  const paymentMethods: { [key: string]: number } = {};
  filteredSales.forEach(sale => {
    const method = sale.paymentMethod || 'N/A';
    paymentMethods[method] = (paymentMethods[method] || 0) + Number(sale.total);
  });

  const maxDailySale = Math.max(...dailySales.map(d => d.total), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-1">Análisis y estadísticas de ventas</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Período:</span>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'year'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8" />
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-sm opacity-90">Ingresos Totales</p>
              <p className="text-3xl font-bold mt-1">${totalRevenue.toFixed(2)}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <ShoppingCart className="w-8 h-8" />
                <BarChart3 className="w-6 h-6" />
              </div>
              <p className="text-sm opacity-90">Total Órdenes</p>
              <p className="text-3xl font-bold mt-1">{totalOrders}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8" />
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-sm opacity-90">Ticket Promedio</p>
              <p className="text-3xl font-bold mt-1">${avgTicket.toFixed(2)}</p>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Sales Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ventas Diarias</h3>
              <div className="space-y-2">
                {dailySales.slice(-7).map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-24">{day.date}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.total / maxDailySale) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full flex items-center justify-end pr-2"
                      >
                        <span className="text-xs font-bold text-white">${day.total.toFixed(0)}</span>
                      </motion.div>
                    </div>
                    <span className="text-sm text-gray-500 w-16">{day.count} ventas</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Métodos de Pago</h3>
              <div className="space-y-3">
                {Object.entries(paymentMethods).map(([method, amount], index) => {
                  const percentage = (amount / totalRevenue) * 100;
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{method}</span>
                        <span className="text-sm font-bold text-gray-900">${amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Productos Más Vendidos</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% del Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topProducts.length > 0 ? topProducts.map((product, index) => {
                    // Validación para evitar NaN y valores inválidos
                    const revenue = product.revenue || 0;
                    const quantity = product.quantity || 0;
                    const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-gray-900">#{index + 1}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">{product.productName}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{quantity} unidades</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-green-600">${revenue.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay datos de productos vendidos en el período seleccionado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
