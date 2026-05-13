import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, X, DollarSign, ShoppingCart, Calendar, User, Clock } from 'lucide-react';
import { API_URL } from '../lib/config';

interface SaleItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Sale {
  id: string;
  folio: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  userId: string;
}

export const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await fetch(`${API_URL}/sales?t=${Date.now()}`);
      const data = await response.json();
      // Mapear datos del API a la estructura esperada
      const mappedSales = data.map((sale: any) => ({
        id: sale.id,
        folio: sale.folio,
        customerName: sale.customerName,
        items: sale.items || [],
        subtotal: Number(sale.subtotal || 0),
        tax: Number(sale.taxAmount || 0),
        total: Number(sale.totalAmount || 0),
        paymentMethod: sale.payments?.[0]?.method || 'N/A',
        status: sale.status,
        createdAt: sale.createdAt,
        userId: sale.createdByUserId
      }));
      setSales(mappedSales);
      console.log('✅ Ventas cargadas:', mappedSales.length);
    } catch (error) {
      console.error('Error cargando ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (sale: Sale) => {
    const saleDate = new Date(sale.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      return saleDate >= today;
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return saleDate >= monthAgo;
    }
    return true;
  };

  const filteredSales = sales
    .filter(filterByDate)
    .filter(sale =>
      sale.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const avgTicket = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-600 mt-1">Historial y análisis de ventas</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Download className="w-5 h-5" />
          Exportar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Número de Ventas</p>
              <p className="text-2xl font-bold text-gray-900">{filteredSales.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ticket Promedio</p>
              <p className="text-2xl font-bold text-gray-900">${avgTicket.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por folio o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'all'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'today' ? 'Hoy' : filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Todo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando ventas...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{sale.folio}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{sale.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(sale.createdAt).toLocaleDateString('es-MX')}
                        <span className="ml-1">{new Date(sale.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{sale.items?.length || 0} items</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">${Number(sale.total).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {sale.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        sale.status === 'READY' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalle de Venta</h2>
                <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Folio</p>
                    <p className="font-bold text-gray-900">{selectedSale.folio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-bold text-gray-900">{selectedSale.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-bold text-gray-900">
                      {new Date(selectedSale.createdAt).toLocaleDateString('es-MX')} {new Date(selectedSale.createdAt).toLocaleTimeString('es-MX')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Método de Pago</p>
                    <p className="font-bold text-gray-900">{selectedSale.paymentMethod}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-3">Productos</h3>
                  <div className="space-y-2">
                    {selectedSale.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${Number(item.total).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">${Number(item.price).toFixed(2)} c/u</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${Number(selectedSale.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA</span>
                      <span className="font-medium">${Number(selectedSale.tax).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span className="text-indigo-600">${Number(selectedSale.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
