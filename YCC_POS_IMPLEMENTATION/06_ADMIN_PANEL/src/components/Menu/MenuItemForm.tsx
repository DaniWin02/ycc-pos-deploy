import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X,
  Save,
  Plus,
  Trash2,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { 
  MenuItem, 
  MenuItemCreateRequest, 
  MenuItemUpdateRequest,
  MenuCategory,
  MenuItemRecipeItem,
  RecipeIngredient,
  MenuFoodCostStatus
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Form validation schema
const menuItemSchema = z.object({
  sku: z.string().min(1, 'SKU es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Categoría es requerida'),
  price: z.number().min(0, 'Precio debe ser mayor o igual a 0'),
  cost: z.number().min(0, 'Costo debe ser mayor o igual a 0'),
  taxRate: z.number().min(0).max(1, 'Tasa de impuesto debe estar entre 0 y 1'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().min(0),
  isActive: z.boolean(),
  isAvailable: z.boolean(),
  trackInventory: z.boolean(),
  preparationTime: z.number().min(0),
  calories: z.number().min(0),
  allergens: z.array(z.string()),
  dietaryRestrictions: z.array(z.string())
})

type MenuItemFormData = z.infer<typeof menuItemSchema>

interface MenuItemFormProps {
  item?: MenuItem
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// Mock API functions
const fetchCategories = async (): Promise<MenuCategory[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return [
    { id: 'cat-1', name: 'Bebidas', description: 'Todas las bebidas', parentId: null, sortOrder: 1, isActive: true, imageUrl: '', createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat-2', name: 'Comidas', description: 'Platillos principales', parentId: null, sortOrder: 2, isActive: true, imageUrl: '', createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat-3', name: 'Postres', description: 'Opciones dulces', parentId: null, sortOrder: 3, isActive: true, imageUrl: '', createdAt: new Date(), updatedAt: new Date() }
  ]
}

const fetchIngredients = async (): Promise<RecipeIngredient[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return [
    { id: 'ing-1', name: 'Carne de res', description: 'Carne premium', unit: 'kg', currentCost: 120, supplier: 'Carnicería Central', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'ing-2', name: 'Pan brioche', description: 'Pan artesanal', unit: 'pieza', currentCost: 8, supplier: 'Panadería', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'ing-3', name: 'Lechuga', description: 'Lechuga fresca', unit: 'pieza', currentCost: 5, supplier: 'Verdurería', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'ing-4', name: 'Tomate', description: 'Tomate fresco', unit: 'pieza', currentCost: 3, supplier: 'Verdurería', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'ing-5', name: 'Queso cheddar', description: 'Queso premium', unit: 'kg', currentCost: 180, supplier: 'Lácteos', isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]
}

const calculateRecipeCost = async (recipe: MenuItemRecipeItem[]): Promise<{ recipeCost: number; breakdown: Array<{ ingredientId: string; ingredientName: string; quantity: number; unit: string; unitCost: number; totalCost: number }> }> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const breakdown = recipe.map(item => ({
    ingredientId: item.ingredientId,
    ingredientName: `Ingrediente ${item.ingredientId}`,
    quantity: item.quantity,
    unit: item.unit,
    unitCost: 10, // Mock unit cost
    totalCost: item.quantity * 10
  }))
  
  const recipeCost = breakdown.reduce((sum, item) => sum + item.totalCost, 0)
  
  return { recipeCost, breakdown }
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

export function MenuItemForm({ item, isOpen, onClose, onSuccess }: MenuItemFormProps) {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [recipeItems, setRecipeItems] = useState<MenuItemRecipeItem[]>(item?.recipe || [])
  const [foodCostCalculation, setFoodCostCalculation] = useState<{
    recipeCost: number
    foodCostPercentage: number
    margin: number
    marginPercentage: number
    status: MenuFoodCostStatus
  } | null>(null)

  // Queries
  const { data: categories } = useQuery({
    queryKey: ['menu-categories', currentStore],
    queryFn: fetchCategories,
    enabled: isOpen
  })

  const { data: ingredients } = useQuery({
    queryKey: ['recipe-ingredients', currentStore],
    queryFn: fetchIngredients,
    enabled: isOpen
  })

  // Form setup
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: item ? {
      sku: item.sku,
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId,
      price: item.price,
      cost: item.cost || 0,
      taxRate: item.taxRate,
      imageUrl: item.imageUrl || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      isAvailable: item.isAvailable,
      trackInventory: item.trackInventory,
      preparationTime: item.preparationTime || 0,
      calories: item.calories || 0,
      allergens: item.allergens || [],
      dietaryRestrictions: item.dietaryRestrictions || []
    } : {
      sku: '',
      name: '',
      description: '',
      categoryId: '',
      price: 0,
      cost: 0,
      taxRate: 0.16,
      imageUrl: '',
      sortOrder: 1,
      isActive: true,
      isAvailable: true,
      trackInventory: false,
      preparationTime: 15,
      calories: 0,
      allergens: [],
      dietaryRestrictions: []
    }
  })

  // Watch price and cost for real-time calculation
  const watchedPrice = watch('price')
  const watchedCost = watch('cost')

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      onSuccess()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MenuItemUpdateRequest }) =>
      updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      onSuccess()
    }
  })

  // Calculate food cost in real-time
  useEffect(() => {
    if (watchedPrice > 0 && watchedCost >= 0) {
      const recipeCost = recipeItems.reduce((sum, item) => {
        const ingredient = ingredients?.find(ing => ing.id === item.ingredientId)
        return sum + (item.quantity * (ingredient?.currentCost || 0))
      }, 0)
      
      const totalCost = Math.max(watchedCost, recipeCost)
      const foodCostPercentage = (totalCost / watchedPrice) * 100
      const margin = watchedPrice - totalCost
      const marginPercentage = (margin / watchedPrice) * 100
      
      let status: MenuFoodCostStatus
      if (foodCostPercentage < 30) status = 'good'
      else if (foodCostPercentage <= 35) status = 'warning'
      else status = 'critical'
      
      setFoodCostCalculation({
        recipeCost,
        foodCostPercentage,
        margin,
        marginPercentage,
        status
      })
    }
  }, [watchedPrice, watchedCost, recipeItems, ingredients])

  // Recipe management
  const addRecipeItem = () => {
    setRecipeItems([...recipeItems, {
      id: `recipe-${Date.now()}`,
      menuItemId: item?.id || '',
      ingredientId: '',
      quantity: 1,
      unit: 'pieza',
      createdAt: new Date(),
      updatedAt: new Date()
    }])
  }

  const updateRecipeItem = (index: number, field: keyof MenuItemRecipeItem, value: any) => {
    const updatedItems = [...recipeItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setRecipeItems(updatedItems)
  }

  const removeRecipeItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index))
  }

  // Form submission
  const onSubmit = async (data: MenuItemFormData) => {
    try {
      const submitData = {
        ...data,
        recipe: recipeItems
      }

      if (item) {
        updateMutation.mutate({ id: item.id, data: submitData })
      } else {
        createMutation.mutate(submitData)
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
    }
  }

  // Food cost status colors
  const getFoodCostStatusInfo = (status: MenuFoodCostStatus) => {
    switch (status) {
      case 'good':
        return { color: 'text-admin-success', bg: 'bg-admin-success/10', icon: CheckCircle, label: 'Excelente' }
      case 'warning':
        return { color: 'text-admin-warning', bg: 'bg-admin-warning/10', icon: AlertTriangle, label: 'Atención' }
      case 'critical':
        return { color: 'text-admin-danger', bg: 'bg-admin-danger/10', icon: AlertTriangle, label: 'Crítico' }
      default:
        return { color: 'text-admin-text', bg: 'bg-admin-border', icon: Info, label: 'Sin calcular' }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {item ? 'Editar Platillo' : 'Nuevo Platillo'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    {...register('sku')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                    placeholder="Ej: HAMB-001"
                  />
                  {errors.sku && (
                    <p className="text-red-500 text-sm mt-1">{errors.sku.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                    placeholder="Ej: Hamburguesa Clásica"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                    placeholder="Describe el platillo..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    {...register('categoryId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen URL
                  </label>
                  <input
                    {...register('imageUrl')}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Venta *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      {...register('price', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Base
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      {...register('cost', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.cost && (
                    <p className="text-red-500 text-sm mt-1">{errors.cost.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasa de Impuesto
                  </label>
                  <div className="relative">
                    <input
                      {...register('taxRate', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                      placeholder="0.16"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                  {errors.taxRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxRate.message}</p>
                  )}
                </div>
              </div>

              {/* Food Cost Preview */}
              {foodCostCalculation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    p-4 rounded-lg border
                    ${getFoodCostStatusInfo(foodCostCalculation.status).bg}
                  `}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {React.createElement(getFoodCostStatusInfo(foodCostCalculation.status).icon, {
                        className: `w-5 h-5 ${getFoodCostStatusInfo(foodCostCalculation.status).color}`
                      })}
                      <h3 className="font-semibold text-gray-900">
                        Food Cost Analysis
                      </h3>
                    </div>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${getFoodCostStatusInfo(foodCostCalculation.status).color}
                      ${getFoodCostStatusInfo(foodCostCalculation.status).bg}
                    `}>
                      {getFoodCostStatusInfo(foodCostCalculation.status).label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Costo Receta</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${foodCostCalculation.recipeCost.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Food Cost %</p>
                      <p className="text-lg font-bold text-gray-900">
                        {foodCostCalculation.foodCostPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Margen</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${foodCostCalculation.margin.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Margen %</p>
                      <p className="text-lg font-bold text-gray-900">
                        {foodCostCalculation.marginPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {foodCostCalculation.status === 'critical' && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>¡Atención!</strong> El food cost está por encima del 35%. Considera ajustar el precio o reducir los costos de ingredientes.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Recipe */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Receta del Platillo
                  </h3>
                  <button
                    type="button"
                    onClick={addRecipeItem}
                    className="flex items-center space-x-2 px-3 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Ingrediente</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {recipeItems.map((recipeItem, index) => (
                    <div key={recipeItem.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <select
                        value={recipeItem.ingredientId}
                        onChange={(e) => updateRecipeItem(index, 'ingredientId', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                      >
                        <option value="">Selecciona un ingrediente</option>
                        {ingredients?.map(ing => (
                          <option key={ing.id} value={ing.id}>{ing.name}</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="0.01"
                        value={recipeItem.quantity}
                        onChange={(e) => updateRecipeItem(index, 'quantity', parseFloat(e.target.value))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                        placeholder="Cantidad"
                      />

                      <input
                        type="text"
                        value={recipeItem.unit}
                        onChange={(e) => updateRecipeItem(index, 'unit', e.target.value)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                        placeholder="Unidad"
                      />

                      <button
                        type="button"
                        onClick={() => removeRecipeItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {recipeItems.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        No hay ingredientes en la receta
                      </p>
                      <p className="text-sm text-gray-400">
                        Agrega ingredientes para calcular el food cost real
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo de Preparación (minutos)
                  </label>
                  <input
                    {...register('preparationTime', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calorías
                  </label>
                  <input
                    {...register('calories', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('isActive')}
                      type="checkbox"
                      className="w-4 h-4 text-admin-primary border-gray-300 rounded focus:ring-admin-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Platillo Activo</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('isAvailable')}
                      type="checkbox"
                      className="w-4 h-4 text-admin-primary border-gray-300 rounded focus:ring-admin-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Disponible para Vender</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('trackInventory')}
                      type="checkbox"
                      className="w-4 h-4 text-admin-primary border-gray-300 rounded focus:ring-admin-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Controlar Inventario</span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSubmitting || createMutation.isPending || updateMutation.isPending 
                  ? 'Guardando...' 
                  : item ? 'Actualizar' : 'Crear'
                }
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
