import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Search, Filter } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  currentStock: number
  minStockLevel: number | null
  unit: string
  price: number
  trackInventory: boolean
}

interface StockAlert {
  id: string
  type: string
  level: number
  message: string
  createdAt: string
  product: {
    name: string
    sku: string
    currentStock: number
    unit: string
  }
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddStock, setShowAddStock] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [stockQuantity, setStockQuantity] = useState('')
  const [stockCost, setStockCost] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, alertsRes] = await Promise.all([
        fetch('http://localhost:3004/products'),
        fetch('http://localhost:3004/inventory/alerts')
      ])

      const productsData = await productsRes.json()
      const alertsData = await alertsRes.json()

      setProducts(productsData.filter((p: Product) => p.trackInventory))
      setAlerts(alertsData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStock = async () => {
    if (!selectedProduct || !stockQuantity) return

    try {
      const response = await fetch('http://localhost:3004/inventory/add-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: parseFloat(stockQuantity),
          unitCost: stockCost ? parseFloat(stockCost) : undefined,
          reason: 'Entrada manual desde Admin Panel',
          userId: 'admin-user'
        })
      })

      if (response.ok) {
        setShowAddStock(false)
        setSelectedProduct(null)
        setStockQuantity('')
        setStockCost('')
        loadData()
      }
    } catch (error) {
      console.error('Error agregando stock:', error)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockProducts = products.filter(p =>
    p.minStockLevel && p.currentStock <= p.minStockLevel
  )

  const outOfStockProducts = products.filter(p => p.currentStock <= 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Cargando inventario...</div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-sm text-gray-500 mt-1">Control de stock y alertas</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="w-10 h-10 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock Bajo</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Agotados</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
            </div>
            <TrendingDown className="w-10 h-10 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Alertas Activas</p>
              <p className="text-2xl font-bold text-yellow-600">{alerts.length}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
        </motion.div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas de Inventario
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-center justify-between text-sm">
                <span className="text-yellow-800">{alert.message}</span>
                <span className="text-yellow-600">{alert.product.currentStock} {alert.product.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock Mínimo</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => {
                const isLowStock = product.minStockLevel && product.currentStock <= product.minStockLevel
                const isOutOfStock = product.currentStock <= 0

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                        {product.currentStock} {product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right">
                      {product.minStockLevel || '-'} {product.minStockLevel ? product.unit : ''}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Stock Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowAddStock(true)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar Stock */}
      {showAddStock && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Agregar Stock - {selectedProduct.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad a agregar *
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo unitario (opcional)
                </label>
                <input
                  type="number"
                  value={stockCost}
                  onChange={(e) => setStockCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="bg-gray-50 rounded p-3 text-sm">
                <p className="text-gray-600">Stock actual: <span className="font-semibold">{selectedProduct.currentStock} {selectedProduct.unit}</span></p>
                {stockQuantity && (
                  <p className="text-gray-600 mt-1">
                    Nuevo stock: <span className="font-semibold text-green-600">
                      {(parseFloat(selectedProduct.currentStock.toString()) + parseFloat(stockQuantity)).toFixed(2)} {selectedProduct.unit}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddStock(false)
                  setSelectedProduct(null)
                  setStockQuantity('')
                  setStockCost('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStock}
                disabled={!stockQuantity || parseFloat(stockQuantity) <= 0}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar Stock
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
