import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'
import { 
  StoreStockLevel, 
  StockStatus,
  StockLevelFilters,
  InventoryStats,
  StockAlert
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions
const fetchStockLevels = async (filters?: StockLevelFilters): Promise<StoreStockLevel[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'stock-1',
      storeId: 'store-1',
      ingredientId: 'ing-1',
      currentStock: 15.5,
      minStockLevel: 10,
      maxStockLevel: 100,
      reorderPoint: 20,
      unitCost: 120.00,
      totalValue: 1860.00,
      lastUpdated: new Date(),
      status: StockStatus.IN_STOCK,
      ingredient: {
        id: 'ing-1',
        name: 'Carne de Res Premium',
        sku: 'CAR-001',
        unit: 'kg',
        currentCost: 120.00,
        minStockLevel: 10,
        maxStockLevel: 100,
        reorderPoint: 20,
        reorderQuantity: 50,
        isActive: true,
        trackExpiry: true,
        averageCost: 118.50,
        lastCostUpdate: new Date(),
        imageUrl: '/images/carne.jpg',
        allergenInfo: [],
        storageInfo: 'Refrigerado 0-4°C',
        shelfLife: 7,
        barcode: '7501234567890'
      }
    },
    {
      id: 'stock-2',
      storeId: 'store-1',
      ingredientId: 'ing-2',
      currentStock: 45,
      minStockLevel: 50,
      maxStockLevel: 500,
      reorderPoint: 100,
      unitCost: 8.00,
      totalValue: 360.00,
      lastUpdated: new Date(),
      status: StockStatus.LOW_STOCK,
      ingredient: {
        id: 'ing-2',
        name: 'Pan Brioche Artesanal',
        sku: 'PAN-001',
        unit: 'pieza',
        currentCost: 8.00,
        minStockLevel: 50,
        maxStockLevel: 500,
        reorderPoint: 100,
        reorderQuantity: 200,
        isActive: true,
        trackExpiry: true,
        averageCost: 7.80,
        lastCostUpdate: new Date(),
        imageUrl: '/images/pan.jpg',
        allergenInfo: ['gluten', 'lacteos'],
        storageInfo: 'Ambiente seco',
        shelfLife: 3,
        barcode: '7501234567891'
      }
    },
    {
      id: 'stock-3',
      storeId: 'store-1',
      ingredientId: 'ing-3',
      currentStock: 3.2,
      minStockLevel: 5,
      maxStockLevel: 50,
      reorderPoint: 10,
      unitCost: 180.00,
      totalValue: 576.00,
      lastUpdated: new Date(),
      status: StockStatus.LOW_STOCK,
      ingredient: {
        id: 'ing-3',
        name: 'Queso Cheddar',
        sku: 'QUE-001',
        unit: 'kg',
        currentCost: 180.00,
        minStockLevel: 5,
        maxStockLevel: 50,
        reorderPoint: 10,
        reorderQuantity: 25,
        isActive: true,
        trackExpiry: true,
        averageCost: 175.00,
        lastCostUpdate: new Date(),
        imageUrl: '/images/queso.jpg',
        allergenInfo: ['lacteos'],
        storageInfo: 'Refrigerado 0-4°C',
        shelfLife: 14,
        barcode: '7501234567892'
      }
    },
    {
      id: 'stock-4',
      storeId: 'store-1',
      ingredientId: 'ing-4',
      currentStock: 8,
      minStockLevel: 20,
      maxStockLevel: 100,
      reorderPoint: 40,
      unitCost: 5.00,
      totalValue: 40.00,
      lastUpdated: new Date(),
      status: StockStatus.OUT_OF_STOCK,
      ingredient: {
        id: 'ing-4',
        name: 'Lechuga Fresca',
        sku: 'LEC-001',
        unit: 'pieza',
        currentCost: 5.00,
        minStockLevel: 20,
        maxStockLevel: 100,
        reorderPoint: 40,
        reorderQuantity: 50,
        isActive: true,
        trackExpiry: true,
        averageCost: 4.80,
        lastCostUpdate: new Date(),
        imageUrl: '/images/lechuga.jpg',
        allergenInfo: [],
        storageInfo: 'Refrigerado 0-4°C',
        shelfLife: 5,
        barcode: '7501234567893'
      }
    },
    {
      id: 'stock-5',
      storeId: 'store-1',
      ingredientId: 'ing-5',
      currentStock: 12.5,
      minStockLevel: 8,
      maxStockLevel: 40,
      reorderPoint: 15,
      unitCost: 25.00,
      totalValue: 312.50,
      lastUpdated: new Date(),
      status: StockStatus.IN_STOCK,
      ingredient: {
        id: 'ing-5',
        name: 'Tomate Fresco',
        sku: 'TOM-001',
        unit: 'kg',
        currentCost: 25.00,
        minStockLevel: 8,
        maxStockLevel: 40,
        reorderPoint: 15,
        reorderQuantity: 20,
        isActive: true,
        trackExpiry: true,
        averageCost: 24.50,
        lastCostUpdate: new Date(),
        imageUrl: '/images/tomate.jpg',
        allergenInfo: [],
        storageInfo: 'Refrigerado 0-4°C',
        shelfLife: 7,
        barcode: '7501234567894'
      }
    },
    {
      id: 'stock-6',
      storeId: 'store-1',
      ingredientId: 'ing-6',
      currentStock: 2.5,
      minStockLevel: 10,
      maxStockLevel: 30,
      reorderPoint: 15,
      unitCost: 95.00,
      totalValue: 237.50,
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: StockStatus.EXPIRED,
      ingredient: {
        id: 'ing-6',
        name: 'Pollo Fresco',
        sku: 'POL-001',
        unit: 'kg',
        currentCost: 95.00,
        minStockLevel: 10,
        maxStockLevel: 30,
        reorderPoint: 15,
        reorderQuantity: 20,
        isActive: true,
        trackExpiry: true,
        averageCost: 92.00,
        lastCostUpdate: new Date(),
        imageUrl: '/images/pollo.jpg',
        allergenInfo: [],
        storageInfo: 'Refrigerado 0-4°C',
        shelfLife: 3,
        barcode: '7501234567895'
      }
    }
  ]
}

const fetchInventoryStats = async (): Promise<InventoryStats> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    totalIngredients: 6,
    activeIngredients: 6,
    lowStockItems: 2,
    outOfStockItems: 1,
    totalValue: 3386.00,
    expiringSoonItems: 1,
    expiredItems: 1,
    pendingPurchaseOrders: 2,
    pendingWasteRecords: 0
  }
}

const fetchStockAlerts = async (): Promise<StockAlert[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return [
    {
      ingredientId: 'ing-2',
      ingredientName: 'Pan Brioche Artesanal',
      currentStock: 45,
      minStockLevel: 50,
      maxStockLevel: 500,
      status: StockStatus.LOW_STOCK,
      unit: 'pieza',
      unitCost: 8.00,
      totalValue: 360.00,
      daysOfStock: 2,
      reorderQuantity: 200,
      lastUpdated: new Date(),
      storeId: 'store-1'
    },
    {
      ingredientId: 'ing-3',
      ingredientName: 'Queso Cheddar',
      currentStock: 3.2,
      minStockLevel: 5,
      maxStockLevel: 50,
      status: StockStatus.LOW_STOCK,
      unit: 'kg',
      unitCost: 180.00,
      totalValue: 576.00,
      daysOfStock: 1,
      reorderQuantity: 25,
      lastUpdated: new Date(),
      storeId: 'store-1'
    },
    {
      ingredientId: 'ing-4',
      ingredientName: 'Lechuga Fresca',
      currentStock: 8,
      minStockLevel: 20,
      maxStockLevel: 100,
      status: StockStatus.OUT_OF_STOCK,
      unit: 'pieza',
      unitCost: 5.00,
      totalValue: 40.00,
      daysOfStock: 0,
      reorderQuantity: 50,
      lastUpdated: new Date(),
      storeId: 'store-1'
    }
  ]
}

export function InventoryStockPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | ''>('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [showExpiringSoon, setShowExpiringSoon] = useState(false)
  const [showExpired, setShowExpired] = useState(false)

  // Queries
  const { data: stockLevels, isLoading, refetch } = useQuery({
    queryKey: ['stock-levels', currentStore, searchTerm, selectedStatus, showLowStock, showOutOfStock, showExpiringSoon, showExpired],
    queryFn: () => fetchStockLevels({
      storeId: currentStore?.id,
      status: selectedStatus || undefined,
      lowStock: showLowStock || undefined,
      outOfStock: showOutOfStock || undefined,
      expiringSoon: showExpiringSoon || undefined,
      expired: showExpired || undefined
    }),
    refetchInterval: 30000
  })

  const { data: stats } = useQuery({
    queryKey: ['inventory-stats', currentStore],
    queryFn: fetchInventoryStats,
    refetchInterval: 60000
  })

  const { data: alerts } = useQuery({
    queryKey: ['stock-alerts', currentStore],
    queryFn: fetchStockAlerts,
    refetchInterval: 30000
  })

  // Get stock status info
  const getStockStatusInfo = (status: StockStatus) => {
    switch (status) {
      case StockStatus.IN_STOCK:
        return { icon: CheckCircle, color: 'text-admin-success', bg: 'bg-admin-success/10', label: 'En Stock' }
      case StockStatus.LOW_STOCK:
        return { icon: AlertTriangle, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Stock Bajo' }
      case StockStatus.OUT_OF_STOCK:
        return { icon: XCircle, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Sin Stock' }
      case StockStatus.EXPIRED:
        return { icon: XCircle, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Vencido' }
      case StockStatus.DAMAGED:
        return { icon: XCircle, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Dañado' }
      default:
        return { icon: Package, color: 'text-admin-text', bg: 'bg-admin-border', label: 'Desconocido' }
    }
  }

  // Calculate stock percentage
  const getStockPercentage = (current: number, min: number, max: number) => {
    if (max === min) return 100
    return ((current - min) / (max - min)) * 100
  }

  // Get stock bar color
  const getStockBarColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-admin-success'
    if (percentage >= 30) return 'bg-admin-warning'
    return 'bg-admin-danger'
  }

  // Filter stock levels
  const filteredStockLevels = stockLevels?.filter(stockLevel => {
    const matchesSearch = stockLevel.ingredient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stockLevel.ingredient?.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !selectedStatus || stockLevel.status === selectedStatus
    const matchesLowStock = !showLowStock || stockLevel.status === StockStatus.LOW_STOCK
    const matchesOutOfStock = !showOutOfStock || stockLevel.status === StockStatus.OUT_OF_STOCK
    const matchesExpiringSoon = !showExpiringSoon || false // TODO: implement expiring logic
    const matchesExpired = !showExpired || stockLevel.status === StockStatus.EXPIRED
    return matchesSearch && matchesStatus && matchesLowStock && matchesOutOfStock && matchesExpiringSoon && matchesExpired
  }) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-admin-text">
            Niveles de Stock
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Monitoreo de inventario por tienda
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-border transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Actualizar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-border transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Exportar</span>
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
          <input
            type="text"
            placeholder="Buscar ingredientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as StockStatus | '')}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todos los estados</option>
          <option value={StockStatus.IN_STOCK}>En Stock</option>
          <option value={StockStatus.LOW_STOCK}>Stock Bajo</option>
          <option value={StockStatus.OUT_OF_STOCK}>Sin Stock</option>
          <option value={StockStatus.EXPIRED}>Vencido</option>
        </select>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
            className="w-4 h-4 text-admin-primary border-admin-border rounded focus:ring-admin-primary"
          />
          <span className="text-sm text-admin-text">Stock bajo</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOutOfStock}
            onChange={(e) => setShowOutOfStock(e.target.checked)}
            className="w-4 h-4 text-admin-primary border-admin-border rounded focus:ring-admin-primary"
          />
          <span className="text-sm text-admin-text">Sin stock</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showExpired}
            onChange={(e) => setShowExpired(e.target.checked)}
            className="w-4 h-4 text-admin-primary border-admin-border rounded focus:ring-admin-primary"
          />
          <span className="text-sm text-admin-text">Vencidos</span>
        </label>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-admin-text">
                  ${stats.totalValue.toFixed(2)}
                </h3>
                <p className="text-sm text-admin-text-secondary">Valor Total</p>
              </div>
              <div className="w-12 h-12 bg-admin-primary/10 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-admin-primary" />
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-admin-success">
                  {stats.activeIngredients}
                </h3>
                <p className="text-sm text-admin-text-secondary">Activos</p>
              </div>
              <div className="w-12 h-12 bg-admin-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-admin-success" />
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-admin-warning">
                  {stats.lowStockItems}
                </h3>
                <p className="text-sm text-admin-text-secondary">Stock Bajo</p>
              </div>
              <div className="w-12 h-12 bg-admin-warning/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-admin-warning" />
              </div>
            </div>
          </div>

          <div className="admin-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-admin-danger">
                  {stats.outOfStockItems}
                </h3>
                <p className="text-sm text-admin-text-secondary">Sin Stock</p>
              </div>
              <div className="w-12 h-12 bg-admin-danger/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-admin-danger" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Levels Table */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredStockLevels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-4 font-medium text-admin-text">Ingrediente</th>
                  <th className="text-left p-4 font-medium text-admin-text">Stock Actual</th>
                  <th className="text-left p-4 font-medium text-admin-text">Rango</th>
                  <th className="text-left p-4 font-medium text-admin-text">Porcentaje</th>
                  <th className="text-left p-4 font-medium text-admin-text">Valor Total</th>
                  <th className="text-left p-4 font-medium text-admin-text">Estado</th>
                  <th className="text-left p-4 font-medium text-admin-text">Última Actualización</th>
                </tr>
              </thead>
              <tbody>
                {filteredStockLevels.map((stockLevel, index) => {
                  const statusInfo = getStockStatusInfo(stockLevel.status)
                  const stockPercentage = getStockPercentage(
                    stockLevel.currentStock,
                    stockLevel.minStockLevel,
                    stockLevel.maxStockLevel
                  )
                  const stockBarColor = getStockBarColor(stockPercentage)
                  
                  return (
                    <motion.tr
                      key={stockLevel.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-admin-border/50 hover:bg-admin-border/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {stockLevel.ingredient?.imageUrl && (
                            <img
                              src={stockLevel.ingredient.imageUrl}
                              alt={stockLevel.ingredient.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-admin-text">{stockLevel.ingredient?.name}</h4>
                            <p className="text-sm text-admin-text-secondary">
                              SKU: {stockLevel.ingredient?.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-admin-text">
                            {stockLevel.currentStock.toFixed(2)}
                          </span>
                          <span className="text-sm text-admin-text-secondary">
                            {stockLevel.ingredient?.unit}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text-secondary">
                          {stockLevel.minStockLevel} - {stockLevel.maxStockLevel} {stockLevel.ingredient?.unit}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-admin-text">
                              {stockPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stockPercentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className={`h-2 rounded-full ${stockBarColor}`}
                            />
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-lg font-bold text-admin-text">
                          ${stockLevel.totalValue.toFixed(2)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${statusInfo.bg} ${statusInfo.color}
                        `}>
                          {React.createElement(statusInfo.icon, { className: 'w-3 h-3 inline mr-1' })}
                          {statusInfo.label}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text-secondary">
                          {new Date(stockLevel.lastUpdated).toLocaleDateString()}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-admin-border rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-admin-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
              {searchTerm ? 'No se encontraron niveles de stock' : 'No hay niveles de stock'}
            </h3>
            <p className="text-admin-text-secondary mb-4">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'No hay datos de stock disponibles'
              }
            </p>
          </div>
        )}
      </div>

      {/* Stock Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-admin-text mb-4">
            Alertas de Stock
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.ingredientId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  p-4 rounded-lg border
                  ${alert.status === StockStatus.OUT_OF_STOCK 
                    ? 'bg-admin-danger/10 border-admin-danger/30' 
                    : 'bg-admin-warning/10 border-admin-warning/30'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {React.createElement(
                      alert.status === StockStatus.OUT_OF_STOCK ? XCircle : AlertTriangle,
                      {
                        className: `w-5 h-5 ${
                          alert.status === StockStatus.OUT_OF_STOCK 
                            ? 'text-admin-danger' 
                            : 'text-admin-warning'
                        }`
                      }
                    )}
                    <div>
                      <h4 className="font-medium text-admin-text">{alert.ingredientName}</h4>
                      <p className="text-sm text-admin-text-secondary">
                        Stock actual: {alert.currentStock} {alert.unit} | 
                        Mínimo: {alert.minStockLevel} {alert.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-admin-text">
                      ${alert.totalValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-admin-text-secondary">
                      {alert.daysOfStock} días de stock
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
