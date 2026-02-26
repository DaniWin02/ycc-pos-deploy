import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  InventoryIngredient, 
  InventoryIngredientCreateRequest, 
  InventoryIngredientUpdateRequest,
  InventoryIngredientFilters,
  StockStatus
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions
const fetchIngredients = async (filters?: InventoryIngredientFilters): Promise<InventoryIngredient[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'ing-1',
      name: 'Carne de Res Premium',
      description: 'Carne de primera calidad para hamburguesas',
      sku: 'CAR-001',
      unit: 'kg',
      currentCost: 120.00,
      minStockLevel: 10,
      maxStockLevel: 100,
      reorderPoint: 20,
      reorderQuantity: 50,
      supplierId: 'sup-1',
      categoryId: 'cat-1',
      isActive: true,
      trackExpiry: true,
      averageCost: 118.50,
      lastCostUpdate: new Date(),
      imageUrl: '/images/carne.jpg',
      allergenInfo: [],
      storageInfo: 'Refrigerado 0-4°C',
      shelfLife: 7,
      barcode: '7501234567890',
      weight: 1,
      volume: 0.001,
      stockLevels: [
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
          status: StockStatus.IN_STOCK
        }
      ]
    },
    {
      id: 'ing-2',
      name: 'Pan Brioche Artesanal',
      description: 'Pan artesanal para hamburguesas',
      sku: 'PAN-001',
      unit: 'pieza',
      currentCost: 8.00,
      minStockLevel: 50,
      maxStockLevel: 500,
      reorderPoint: 100,
      reorderQuantity: 200,
      supplierId: 'sup-2',
      categoryId: 'cat-2',
      isActive: true,
      trackExpiry: true,
      averageCost: 7.80,
      lastCostUpdate: new Date(),
      imageUrl: '/images/pan.jpg',
      allergenInfo: ['gluten', 'lacteos'],
      storageInfo: 'Ambiente seco',
      shelfLife: 3,
      barcode: '7501234567891',
      weight: 0.1,
      volume: 0.0002,
      stockLevels: [
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
          status: StockStatus.LOW_STOCK
        }
      ]
    },
    {
      id: 'ing-3',
      name: 'Queso Cheddar',
      description: 'Queso cheddar premium',
      sku: 'QUE-001',
      unit: 'kg',
      currentCost: 180.00,
      minStockLevel: 5,
      maxStockLevel: 50,
      reorderPoint: 10,
      reorderQuantity: 25,
      supplierId: 'sup-1',
      categoryId: 'cat-3',
      isActive: true,
      trackExpiry: true,
      averageCost: 175.00,
      lastCostUpdate: new Date(),
      imageUrl: '/images/queso.jpg',
      allergenInfo: ['lacteos'],
      storageInfo: 'Refrigerado 0-4°C',
      shelfLife: 14,
      barcode: '7501234567892',
      weight: 1,
      volume: 0.001,
      stockLevels: [
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
          status: StockStatus.LOW_STOCK
        }
      ]
    },
    {
      id: 'ing-4',
      name: 'Lechuga Fresca',
      description: 'Lechuga romana fresca',
      sku: 'LEC-001',
      unit: 'pieza',
      currentCost: 5.00,
      minStockLevel: 20,
      maxStockLevel: 100,
      reorderPoint: 40,
      reorderQuantity: 50,
      supplierId: 'sup-3',
      categoryId: 'cat-4',
      isActive: true,
      trackExpiry: true,
      averageCost: 4.80,
      lastCostUpdate: new Date(),
      imageUrl: '/images/lechuga.jpg',
      allergenInfo: [],
      storageInfo: 'Refrigerado 0-4°C',
      shelfLife: 5,
      barcode: '7501234567893',
      weight: 0.2,
      volume: 0.0003,
      stockLevels: [
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
          status: StockStatus.OUT_OF_STOCK
        }
      ]
    },
    {
      id: 'ing-5',
      name: 'Tomate Fresco',
      description: 'Tomate fresco de calidad',
      sku: 'TOM-001',
      unit: 'kg',
      currentCost: 25.00,
      minStockLevel: 8,
      maxStockLevel: 40,
      reorderPoint: 15,
      reorderQuantity: 20,
      supplierId: 'sup-3',
      categoryId: 'cat-4',
      isActive: true,
      trackExpiry: true,
      averageCost: 24.50,
      lastCostUpdate: new Date(),
      imageUrl: '/images/tomate.jpg',
      allergenInfo: [],
      storageInfo: 'Refrigerado 0-4°C',
      shelfLife: 7,
      barcode: '7501234567894',
      weight: 1,
      volume: 0.001,
      stockLevels: [
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
          status: StockStatus.IN_STOCK
        }
      ]
    }
  ]
}

const createIngredient = async (data: InventoryIngredientCreateRequest): Promise<InventoryIngredient> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `ing-${Date.now()}`,
    ...data,
    averageCost: data.currentCost,
    lastCostUpdate: new Date(),
    stockLevels: []
  }
}

const updateIngredient = async (id: string, data: InventoryIngredientUpdateRequest): Promise<InventoryIngredient> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id,
    ...data,
    averageCost: data.currentCost || 0,
    lastCostUpdate: new Date(),
    stockLevels: []
  } as InventoryIngredient
}

const deleteIngredient = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
}

export function InventoryIngredientsPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [showInactive, setShowInactive] = useState(false)
  const [showLowStock, setShowLowStock] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<InventoryIngredient | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Queries
  const { data: ingredients, isLoading } = useQuery({
    queryKey: ['inventory-ingredients', currentStore, searchTerm, selectedCategory, selectedSupplier, showInactive, showLowStock],
    queryFn: () => fetchIngredients({
      search: searchTerm,
      categoryId: selectedCategory || undefined,
      supplierId: selectedSupplier || undefined,
      isActive: showInactive ? undefined : true,
      lowStock: showLowStock || undefined
    }),
    refetchInterval: 30000
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-ingredients'] })
      setIsCreateModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InventoryIngredientUpdateRequest }) =>
      updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-ingredients'] })
      setEditingIngredient(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-ingredients'] })
    }
  })

  // Handlers
  const handleCreateIngredient = (data: InventoryIngredientCreateRequest) => {
    createMutation.mutate(data)
  }

  const handleUpdateIngredient = (data: InventoryIngredientUpdateRequest) => {
    if (editingIngredient) {
      updateMutation.mutate({ id: editingIngredient.id, data })
    }
  }

  const handleDeleteIngredient = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ingrediente?')) {
      deleteMutation.mutate(id)
    }
  }

  // Get stock status for current store
  const getStockStatus = (ingredient: InventoryIngredient) => {
    const stockLevel = ingredient.stockLevels?.find(sl => sl.storeId === currentStore?.id)
    return stockLevel?.status || StockStatus.OUT_OF_STOCK
  }

  const getCurrentStock = (ingredient: InventoryIngredient) => {
    const stockLevel = ingredient.stockLevels?.find(sl => sl.storeId === currentStore?.id)
    return stockLevel?.currentStock || 0
  }

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

  // Filter ingredients
  const filteredIngredients = ingredients?.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || ingredient.categoryId === selectedCategory
    const matchesSupplier = !selectedSupplier || ingredient.supplierId === selectedSupplier
    const matchesActive = showInactive || ingredient.isActive
    const matchesLowStock = !showLowStock || getStockStatus(ingredient) === StockStatus.LOW_STOCK
    return matchesSearch && matchesCategory && matchesSupplier && matchesActive && matchesLowStock
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
            Ingredientes del Inventario
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Gestiona los ingredientes y sus niveles de stock
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Ingrediente</span>
        </motion.button>
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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todas las categorías</option>
          <option value="cat-1">Carnes</option>
          <option value="cat-2">Panadería</option>
          <option value="cat-3">Lácteos</option>
          <option value="cat-4">Verduras</option>
        </select>

        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todos los proveedores</option>
          <option value="sup-1">Carnicería Central</option>
          <option value="sup-2">Panadería</option>
          <option value="sup-3">Verdurería</option>
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
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-admin-primary border-admin-border rounded focus:ring-admin-primary"
          />
          <span className="text-sm text-admin-text">Mostrar inactivos</span>
        </label>
      </div>

      {/* Ingredients Table */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredIngredients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-4 font-medium text-admin-text">SKU</th>
                  <th className="text-left p-4 font-medium text-admin-text">Ingrediente</th>
                  <th className="text-left p-4 font-medium text-admin-text">Categoría</th>
                  <th className="text-left p-4 font-medium text-admin-text">Stock Actual</th>
                  <th className="text-left p-4 font-medium text-admin-text">Costo Unitario</th>
                  <th className="text-left p-4 font-medium text-admin-text">Valor Total</th>
                  <th className="text-left p-4 font-medium text-admin-text">Estado</th>
                  <th className="text-left p-4 font-medium text-admin-text">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((ingredient, index) => {
                  const currentStock = getCurrentStock(ingredient)
                  const stockStatus = getStockStatus(ingredient)
                  const statusInfo = getStockStatusInfo(stockStatus)
                  const totalValue = currentStock * ingredient.currentCost
                  
                  return (
                    <motion.tr
                      key={ingredient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-admin-border/50 hover:bg-admin-border/30 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-admin-text-secondary">{ingredient.sku}</span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {ingredient.imageUrl && (
                            <img
                              src={ingredient.imageUrl}
                              alt={ingredient.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-admin-text">{ingredient.name}</h4>
                            <p className="text-sm text-admin-text-secondary line-clamp-1">
                              {ingredient.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className="text-sm text-admin-text-secondary">
                          {ingredient.categoryId === 'cat-1' ? 'Carnes' : 
                           ingredient.categoryId === 'cat-2' ? 'Panadería' :
                           ingredient.categoryId === 'cat-3' ? 'Lácteos' : 'Verduras'}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-admin-text">
                            {currentStock.toFixed(2)}
                          </span>
                          <span className="text-sm text-admin-text-secondary">
                            {ingredient.unit}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-lg font-bold text-admin-text">
                          ${ingredient.currentCost.toFixed(2)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-lg font-bold text-admin-text">
                          ${totalValue.toFixed(2)}
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
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingIngredient(ingredient)}
                            className="p-2 hover:bg-admin-border rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-admin-text" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteIngredient(ingredient.id)}
                            className="p-2 hover:bg-admin-danger/10 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-admin-danger" />
                          </motion.button>
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
              {searchTerm ? 'No se encontraron ingredientes' : 'No hay ingredientes'}
            </h3>
            <p className="text-admin-text-secondary mb-4">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'Crea tu primer ingrediente para empezar'
              }
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Ingrediente</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            {ingredients?.length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Total Ingredientes</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-success">
            {ingredients?.filter(i => getStockStatus(i) === StockStatus.IN_STOCK).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">En Stock</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-warning">
            {ingredients?.filter(i => getStockStatus(i) === StockStatus.LOW_STOCK).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Stock Bajo</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-danger">
            {ingredients?.filter(i => getStockStatus(i) === StockStatus.OUT_OF_STOCK).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Sin Stock</p>
        </div>
      </div>

      {/* Simple Modal (placeholder for actual form) */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nuevo Ingrediente</h2>
              <p className="text-gray-600 mb-4">
                Formulario de creación de ingrediente (placeholder - implementar formulario completo)
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleCreateIngredient({
                      name: 'Nuevo Ingrediente',
                      description: 'Descripción del ingrediente',
                      sku: 'NEW-001',
                      unit: 'pieza',
                      currentCost: 10,
                      minStockLevel: 5,
                      maxStockLevel: 50,
                      reorderPoint: 10,
                      reorderQuantity: 25,
                      isActive: true,
                      trackExpiry: true
                    })
                  }}
                  className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover"
                >
                  Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
