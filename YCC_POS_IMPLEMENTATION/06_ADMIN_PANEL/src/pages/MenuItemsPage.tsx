import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  Download,
  Upload
} from 'lucide-react'
import { MenuItem, MenuItemCreateRequest, MenuItemUpdateRequest, MenuItemFilters } from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions
const fetchMenuItems = async (filters?: MenuItemFilters): Promise<MenuItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'item-1',
      sku: 'HAMB-001',
      name: 'Hamburguesa Clásica',
      description: 'Carne de res, lechuga, tomate, cebolla, pan brioche',
      categoryId: 'cat-2',
      price: 85.00,
      cost: 28.50,
      taxRate: 0.16,
      imageUrl: '/images/hamburguesa.jpg',
      sortOrder: 1,
      isActive: true,
      isAvailable: true,
      trackInventory: true,
      preparationTime: 15,
      calories: 650,
      allergens: ['gluten', 'lacteos'],
      dietaryRestrictions: [],
      modifiers: [],
      recipe: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'item-2',
      sku: 'REFR-001',
      name: 'Coca Cola 600ml',
      description: 'Refresco de cola tradicional',
      categoryId: 'cat-1',
      price: 30.00,
      cost: 12.00,
      taxRate: 0.16,
      imageUrl: '/images/coca-cola.jpg',
      sortOrder: 1,
      isActive: true,
      isAvailable: true,
      trackInventory: false,
      preparationTime: 2,
      calories: 250,
      allergens: [],
      dietaryRestrictions: [],
      modifiers: [],
      recipe: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'item-3',
      sku: 'PAPA-001',
      name: 'Papas Fritas',
      description: 'Papas cortadas a la francesa, crujientes',
      categoryId: 'cat-2',
      price: 45.00,
      cost: 15.00,
      taxRate: 0.16,
      imageUrl: '/images/papas.jpg',
      sortOrder: 2,
      isActive: true,
      isAvailable: true,
      trackInventory: true,
      preparationTime: 10,
      calories: 320,
      allergens: [],
      dietaryRestrictions: ['vegetariano'],
      modifiers: [],
      recipe: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'item-4',
      sku: 'ENS-001',
      name: 'Ensalada César',
      description: 'Lechuga romana, crutones, parmesano, aderezo César',
      categoryId: 'cat-2',
      price: 60.00,
      cost: 22.00,
      taxRate: 0.16,
      imageUrl: '/images/ensalada.jpg',
      sortOrder: 3,
      isActive: true,
      isAvailable: false,
      trackInventory: true,
      preparationTime: 8,
      calories: 280,
      allergens: ['gluten', 'lacteos'],
      dietaryRestrictions: [],
      modifiers: [],
      recipe: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'item-5',
      sku: 'AGUA-001',
      name: 'Agua 600ml',
      description: 'Agua purificada embotellada',
      categoryId: 'cat-1',
      price: 15.00,
      cost: 5.00,
      taxRate: 0.16,
      imageUrl: '/images/agua.jpg',
      sortOrder: 2,
      isActive: true,
      isAvailable: true,
      trackInventory: false,
      preparationTime: 1,
      calories: 0,
      allergens: [],
      dietaryRestrictions: ['vegano', 'sin-gluten'],
      modifiers: [],
      recipe: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

const createMenuItem = async (data: MenuItemCreateRequest): Promise<MenuItem> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `item-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const updateMenuItem = async (id: string, data: MenuItemUpdateRequest): Promise<MenuItem> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  } as MenuItem
}

const deleteMenuItem = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
}

const toggleMenuItemAvailability = async (id: string): Promise<MenuItem> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  // Mock toggle logic
  return {
    id,
    sku: 'TOGGLE-001',
    name: 'Toggled Item',
    categoryId: 'cat-1',
    price: 100,
    taxRate: 0.16,
    sortOrder: 1,
    isActive: true,
    isAvailable: false, // Toggled
    trackInventory: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function MenuItemsPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showInactive, setShowInactive] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Queries
  const { data: items, isLoading } = useQuery({
    queryKey: ['menu-items', currentStore, searchTerm, selectedCategory, showInactive],
    queryFn: () => fetchMenuItems({
      search: searchTerm,
      categoryId: selectedCategory || undefined,
      isActive: showInactive ? undefined : true
    }),
    refetchInterval: 30000
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      setIsCreateModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MenuItemUpdateRequest }) =>
      updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      setEditingItem(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
    }
  })

  const toggleAvailabilityMutation = useMutation({
    mutationFn: toggleMenuItemAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
    }
  })

  // Handlers
  const handleCreateItem = (data: MenuItemCreateRequest) => {
    createMutation.mutate(data)
  }

  const handleUpdateItem = (data: MenuItemUpdateRequest) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data })
    }
  }

  const handleDeleteItem = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este platillo?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleToggleAvailability = (id: string) => {
    toggleAvailabilityMutation.mutate(id)
  }

  // Calculate food cost percentage
  const calculateFoodCost = (item: MenuItem) => {
    if (!item.cost) return 0
    return ((item.cost / item.price) * 100)
  }

  const getFoodCostStatus = (percentage: number) => {
    if (percentage < 30) return { status: 'good', color: 'text-admin-success', bg: 'bg-admin-success/10' }
    if (percentage <= 35) return { status: 'warning', color: 'text-admin-warning', bg: 'bg-admin-warning/10' }
    return { status: 'critical', color: 'text-admin-danger', bg: 'bg-admin-danger/10' }
  }

  // Filter items
  const filteredItems = items?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory
    const matchesActive = showInactive || item.isActive
    return matchesSearch && matchesCategory && matchesActive
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
            Platillos del Menú
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Gestiona tu catálogo de productos
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-border transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Importar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2 px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-border transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Exportar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Platillo</span>
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
          <input
            type="text"
            placeholder="Buscar platillos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-border transition-colors"
        >
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </motion.button>

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

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="admin-card p-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-admin-text mb-2">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                >
                  <option value="">Todas las categorías</option>
                  <option value="cat-1">Bebidas</option>
                  <option value="cat-2">Comidas</option>
                  <option value="cat-3">Postres</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-text mb-2">Rango de precios</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    className="w-full px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                  />
                  <span className="text-admin-text-secondary">-</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    className="w-full px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-text mb-2">Disponibilidad</label>
                <select className="w-full px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20">
                  <option value="">Todos</option>
                  <option value="available">Disponibles</option>
                  <option value="unavailable">No disponibles</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items Table */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-4 font-medium text-admin-text">SKU</th>
                  <th className="text-left p-4 font-medium text-admin-text">Platillo</th>
                  <th className="text-left p-4 font-medium text-admin-text">Categoría</th>
                  <th className="text-left p-4 font-medium text-admin-text">Precio</th>
                  <th className="text-left p-4 font-medium text-admin-text">Food Cost</th>
                  <th className="text-left p-4 font-medium text-admin-text">Estado</th>
                  <th className="text-left p-4 font-medium text-admin-text">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => {
                  const foodCostPercentage = calculateFoodCost(item)
                  const foodCostStatus = getFoodCostStatus(foodCostPercentage)
                  
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-admin-border/50 hover:bg-admin-border/30 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-admin-text-secondary">{item.sku}</span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-admin-text">{item.name}</h4>
                            <p className="text-sm text-admin-text-secondary line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className="text-sm text-admin-text-secondary">
                          {item.categoryId === 'cat-1' ? 'Bebidas' : 
                           item.categoryId === 'cat-2' ? 'Comidas' : 'Postres'}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-lg font-bold text-admin-text">
                          ${item.price.toFixed(2)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${foodCostStatus.bg} ${foodCostStatus.color}
                        `}>
                          {foodCostPercentage.toFixed(1)}%
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${item.isActive 
                              ? 'bg-admin-success/10 text-admin-success' 
                              : 'bg-admin-danger/10 text-admin-danger'
                            }
                          `}>
                            {item.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleAvailability(item.id)}
                            className="p-1 hover:bg-admin-border rounded transition-colors"
                          >
                            {item.isAvailable ? (
                              <Eye className="w-4 h-4 text-admin-success" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-admin-warning" />
                            )}
                          </motion.button>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingItem(item)}
                            className="p-2 hover:bg-admin-border rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-admin-text" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteItem(item.id)}
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
              <Plus className="w-8 h-8 text-admin-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
              {searchTerm ? 'No se encontraron platillos' : 'No hay platillos'}
            </h3>
            <p className="text-admin-text-secondary mb-4">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'Crea tu primer platillo para empezar'
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
                <span>Crear Platillo</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            {items?.length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Total Platillos</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-success">
            {items?.filter(i => i.isActive && i.isAvailable).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Disponibles</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-warning">
            {items?.filter(i => calculateFoodCost(i) > 35).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Food Cost > 35%</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            ${items?.reduce((sum, item) => sum + item.price, 0).toFixed(2) || '0.00'}
          </h3>
          <p className="text-sm text-admin-text-secondary">Valor Total</p>
        </div>
      </div>
    </motion.div>
  )
}
