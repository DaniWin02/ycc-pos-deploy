import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Plus,
  Trash2,
  Save,
  X,
  Search,
  ChefHat,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Edit2,
  Package,
  Calculator,
  PieChart,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  Recipe, 
  RecipeIngredient,
  RecipeSubRecipe,
  RecipeInstruction,
  RecipeCreateRequest,
  RecipeUpdateRequest,
  RecipeDifficulty,
  Allergen
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'
import { AnimatedCounter } from '../components/AnimatedCounter'

// Mock API functions
const fetchRecipe = async (id: string): Promise<Recipe> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: id,
    name: 'Hamburguesa Clásica',
    description: 'Nuestra hamburguesa clásica con carne premium, lechuga fresca, tomate y cebolla',
    category: {
      id: 'cat-1',
      name: 'Hamburguesas',
      description: 'Todas nuestras hamburguesas',
      order: 1,
      isActive: true
    },
    imageUrl: '/images/burger-classic.jpg',
    prepTime: 15,
    cookTime: 10,
    servings: 1,
    difficulty: RecipeDifficulty.EASY,
    isActive: true,
    price: 85.00,
    foodCost: 28.50,
    foodCostPercentage: 33.5,
    theoreticalCost: 27.00,
    ingredients: [
      {
        id: 'ing-1',
        recipeId: id,
        ingredientId: 'ing-1',
        ingredient: 'ing-1',
        quantity: 150,
        unit: 'g',
        unitCost: 0.80,
        totalCost: 120.00,
        isOptional: false,
        notes: 'Carne premium 80/20',
        order: 1
      },
      {
        id: 'ing-2',
        recipeId: id,
        ingredientId: 'ing-2',
        ingredient: 'ing-2',
        quantity: 1,
        unit: 'pieza',
        unitCost: 8.00,
        totalCost: 8.00,
        isOptional: false,
        notes: 'Pan brioche',
        order: 2
      },
      {
        id: 'ing-3',
        recipeId: id,
        ingredientId: 'ing-3',
        ingredient: 'ing-3',
        quantity: 30,
        unit: 'g',
        unitCost: 0.15,
        totalCost: 4.50,
        isOptional: false,
        notes: 'Queso cheddar',
        order: 3
      }
    ],
    subRecipes: [],
    instructions: [
      {
        id: 'inst-1',
        recipeId: id,
        step: 1,
        title: 'Preparar la carne',
        description: 'Formar la hamburguesa y sazonar con sal y pimienta',
        time: 5,
        temperature: 180,
        order: 1
      },
      {
        id: 'inst-2',
        recipeId: id,
        step: 2,
        title: 'Cocinar la hamburguesa',
        description: 'Cocinar a la parrilla por 4 minutos por lado',
        time: 8,
        temperature: 200,
        order: 2
      }
    ],
    allergens: [Allergen.GLUTEN, Allergen.DAIRY],
    nutritionalInfo: {
      calories: 650,
      protein: 35,
      carbohydrates: 45,
      fat: 28,
      fiber: 3,
      sugar: 8,
      sodium: 1200
    },
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  }
}

const fetchIngredients = async (): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return [
    { id: 'ing-1', name: 'Carne de res', unit: 'kg', unitCost: 80.00, category: 'Carnes' },
    { id: 'ing-2', name: 'Pan brioche', unit: 'pieza', unitCost: 8.00, category: 'Panadería' },
    { id: 'ing-3', name: 'Queso cheddar', unit: 'kg', unitCost: 150.00, category: 'Lácteos' },
    { id: 'ing-4', name: 'Lechuga romana', unit: 'kg', unitCost: 15.00, category: 'Vegetales' },
    { id: 'ing-5', name: 'Tomate', unit: 'kg', unitCost: 20.00, category: 'Vegetales' },
    { id: 'ing-6', name: 'Cebolla', unit: 'kg', unitCost: 12.00, category: 'Vegetales' }
  ]
}

const fetchSubRecipes = async (): Promise<Recipe[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return [
    {
      id: 'sub-1',
      name: 'Salsa especial',
      description: 'Salsa secreta de la casa',
      category: { id: 'cat-5', name: 'Salsas', description: 'Salsas y aderezos', order: 5, isActive: true },
      prepTime: 10,
      cookTime: 0,
      servings: 10,
      difficulty: RecipeDifficulty.EASY,
      isActive: true,
      price: 5.00,
      foodCost: 2.50,
      foodCostPercentage: 50.0,
      theoreticalCost: 2.00,
      ingredients: [],
      subRecipes: [],
      instructions: [],
      allergens: [],
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

const updateRecipe = async (id: string, data: RecipeUpdateRequest): Promise<Recipe> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id,
    name: data.name || '',
    description: data.description || '',
    category: {
      id: 'cat-1',
      name: 'Hamburguesas',
      description: 'Todas nuestras hamburguesas',
      order: 1,
      isActive: true
    },
    prepTime: data.prepTime || 0,
    cookTime: data.cookTime || 0,
    servings: data.servings || 1,
    difficulty: data.difficulty || RecipeDifficulty.EASY,
    isActive: data.isActive || true,
    price: data.price || 0,
    ingredients: [],
    subRecipes: [],
    instructions: [],
    allergens: data.allergens || [],
    nutritionalInfo: data.nutritionalInfo,
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function RecipeEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()

  // State
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [ingredients, setIngredients] = useState<any[]>([])
  const [subRecipes, setSubRecipes] = useState<Recipe[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showCostBreakdown, setShowCostBreakdown] = useState(false)
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [subRecipeSearch, setSubRecipeSearch] = useState('')

  // Queries
  const { data: recipeData, isLoading: isLoadingRecipe } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => id ? fetchRecipe(id) : null,
    enabled: !!id
  })

  const { data: ingredientsData, isLoading: isLoadingIngredients } = useQuery({
    queryKey: ['ingredients'],
    queryFn: fetchIngredients
  })

  const { data: subRecipesData, isLoading: isLoadingSubRecipes } = useQuery({
    queryKey: ['sub-recipes'],
    queryFn: fetchSubRecipes
  })

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecipeUpdateRequest }) =>
      updateRecipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', id] })
      setIsEditing(false)
    }
  })

  // Effects
  useEffect(() => {
    if (recipeData) {
      setRecipe(recipeData)
    }
  }, [recipeData])

  useEffect(() => {
    if (ingredientsData) {
      setIngredients(ingredientsData)
    }
  }, [ingredientsData])

  useEffect(() => {
    if (subRecipesData) {
      setSubRecipes(subRecipesData)
    }
  }, [subRecipesData])

  // Calculate total cost
  const calculateTotalCost = (): number => {
    if (!recipe) return 0
    
    const ingredientCost = recipe.ingredients.reduce((sum, ing) => sum + (ing.totalCost || 0), 0)
    const subRecipeCost = recipe.subRecipes.reduce((sum, sub) => sum + (sub.totalCost || 0), 0)
    
    return ingredientCost + subRecipeCost
  }

  // Calculate food cost percentage
  const calculateFoodCostPercentage = (): number => {
    if (!recipe || !recipe.price) return 0
    const totalCost = calculateTotalCost()
    return (totalCost / recipe.price) * 100
  }

  // Update ingredient quantity
  const updateIngredientQuantity = (ingredientId: string, quantity: number) => {
    if (!recipe) return
    
    const updatedIngredients = recipe.ingredients.map(ing => {
      if (ing.ingredientId === ingredientId) {
        const ingredient = ingredients.find(i => i.id === ingredientId)
        const unitCost = ingredient?.unitCost || 0
        const totalCost = quantity * unitCost
        
        return {
          ...ing,
          quantity,
          unitCost,
          totalCost
        }
      }
      return ing
    })
    
    setRecipe({
      ...recipe,
      ingredients: updatedIngredients
    })
  }

  // Add ingredient
  const addIngredient = (ingredientId: string) => {
    if (!recipe) return
    
    const ingredient = ingredients.find(i => i.id === ingredientId)
    if (!ingredient) return
    
    const newIngredient: RecipeIngredient = {
      id: `ing-${Date.now()}`,
      recipeId: recipe.id,
      ingredientId,
      ingredient: ingredientId,
      quantity: 100,
      unit: ingredient.unit,
      unitCost: ingredient.unitCost,
      totalCost: 100 * ingredient.unitCost,
      isOptional: false,
      notes: '',
      order: recipe.ingredients.length + 1
    }
    
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, newIngredient]
    })
  }

  // Remove ingredient
  const removeIngredient = (ingredientId: string) => {
    if (!recipe) return
    
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.filter(ing => ing.ingredientId !== ingredientId)
    })
  }

  // Add sub-recipe
  const addSubRecipe = (subRecipeId: string) => {
    if (!recipe) return
    
    const subRecipe = subRecipes.find(sr => sr.id === subRecipeId)
    if (!subRecipe) return
    
    const newSubRecipe: RecipeSubRecipe = {
      id: `sub-${Date.now()}`,
      recipeId: recipe.id,
      subRecipeId,
      subRecipe,
      quantity: 1,
      unit: 'porción',
      unitCost: subRecipe.foodCost || 0,
      totalCost: subRecipe.foodCost || 0,
      order: recipe.subRecipes.length + 1
    }
    
    setRecipe({
      ...recipe,
      subRecipes: [...recipe.subRecipes, newSubRecipe]
    })
  }

  // Remove sub-recipe
  const removeSubRecipe = (subRecipeId: string) => {
    if (!recipe) return
    
    setRecipe({
      ...recipe,
      subRecipes: recipe.subRecipes.filter(sub => sub.subRecipeId !== subRecipeId)
    })
  }

  // Save recipe
  const handleSave = () => {
    if (!recipe || !id) return
    
    updateMutation.mutate({
      id,
      data: {
        name: recipe.name,
        description: recipe.description,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        price: recipe.price,
        ingredients: recipe.ingredients,
        subRecipes: recipe.subRecipes,
        instructions: recipe.instructions,
        allergens: recipe.allergens,
        nutritionalInfo: recipe.nutritionalInfo
      }
    })
  }

  const totalCost = calculateTotalCost()
  const foodCostPercentage = calculateFoodCostPercentage()

  if (isLoadingRecipe || isLoadingIngredients || isLoadingSubRecipes) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Receta no encontrada</h2>
          <button
            onClick={() => navigate('/admin/recipes')}
            className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover"
          >
            Volver a recetas
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/recipes')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Receta' : recipe.name}
              </h1>
              <p className="text-gray-600">{recipe.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCostBreakdown(!showCostBreakdown)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {showCostBreakdown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showCostBreakdown ? 'Ocultar' : 'Mostrar'} Costos</span>
            </button>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex items-center space-x-2 px-4 py-2 bg-admin-success text-white rounded-lg hover:bg-admin-success-hover disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateMutation.isPending ? 'Guardando...' : 'Guardar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Column - Recipe Details */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={recipe.name}
                    onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={recipe.category.id}
                    onChange={(e) => setRecipe({ 
                      ...recipe, 
                      category: { ...recipe.category, id: e.target.value }
                    })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary disabled:bg-gray-50"
                  >
                    <option value="cat-1">Hamburguesas</option>
                    <option value="cat-2">Ensaladas</option>
                    <option value="cat-3">Acompañamientos</option>
                    <option value="cat-4">Bebidas</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de preparación (min)</label>
                  <input
                    type="number"
                    value={recipe.prepTime}
                    onChange={(e) => setRecipe({ ...recipe, prepTime: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de cocción (min)</label>
                  <input
                    type="number"
                    value={recipe.cookTime}
                    onChange={(e) => setRecipe({ ...recipe, cookTime: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porciones</label>
                  <input
                    type="number"
                    value={recipe.servings}
                    onChange={(e) => setRecipe({ ...recipe, servings: parseInt(e.target.value) || 1 })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de venta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={recipe.price}
                    onChange={(e) => setRecipe({ ...recipe, price: parseFloat(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary disabled:bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={recipe.description || ''}
                  onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Ingredients Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Ingredientes</h2>
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Buscar ingrediente..."
                      value={ingredientSearch}
                      onChange={(e) => setIngredientSearch(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary"
                    />
                  </div>
                )}
              </div>

              {/* Ingredients List */}
              <div className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <motion.div
                    key={ingredient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {ingredients.find(i => i.id === ingredient.ingredientId)?.name || 'Ingrediente'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ingredient.notes}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.01"
                            value={ingredient.quantity}
                            onChange={(e) => updateIngredientQuantity(ingredient.ingredientId, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                          <span className="text-sm text-gray-600">{ingredient.unit}</span>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-900">
                          <AnimatedCounter
                            value={ingredient.totalCost || 0}
                            decimals={2}
                            prefix="$"
                          />
                        </div>
                        
                        <button
                          onClick={() => removeIngredient(ingredient.ingredientId)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-600">
                          {ingredient.quantity} {ingredient.unit}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ${ingredient.totalCost?.toFixed(2)}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Add Ingredient */}
              {isEditing && (
                <div className="mt-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Agregar ingrediente:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {ingredients
                        .filter(ing => 
                          ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
                          !recipe.ingredients.find(r => r.ingredientId === ing.id)
                        )
                        .slice(0, 4)
                        .map(ingredient => (
                          <button
                            key={ingredient.id}
                            onClick={() => addIngredient(ingredient.id)}
                            className="p-2 text-left border border-gray-200 rounded hover:bg-gray-50"
                          >
                            <div className="font-medium text-gray-900">{ingredient.name}</div>
                            <div className="text-xs text-gray-500">${ingredient.unitCost}/{ingredient.unit}</div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sub-recipes Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Sub-recetas</h2>
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Buscar sub-receta..."
                      value={subRecipeSearch}
                      onChange={(e) => setSubRecipeSearch(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary"
                    />
                  </div>
                )}
              </div>

              {/* Sub-recipes List */}
              <div className="space-y-2">
                {recipe.subRecipes.map((subRecipe, index) => (
                  <motion.div
                    key={subRecipe.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {subRecipe.subRecipe.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subRecipe.subRecipe.description}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.01"
                            value={subRecipe.quantity}
                            onChange={(e) => {
                              const updatedSubRecipes = recipe.subRecipes.map(sub => {
                                if (sub.subRecipeId === subRecipe.subRecipeId) {
                                  return {
                                    ...sub,
                                    quantity: parseFloat(e.target.value) || 0,
                                    totalCost: (parseFloat(e.target.value) || 0) * (sub.unitCost || 0)
                                  }
                                }
                                return sub
                              })
                              setRecipe({ ...recipe, subRecipes: updatedSubRecipes })
                            }}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                          <span className="text-sm text-gray-600">{subRecipe.unit}</span>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-900">
                          <AnimatedCounter
                            value={subRecipe.totalCost || 0}
                            decimals={2}
                            prefix="$"
                          />
                        </div>
                        
                        <button
                          onClick={() => removeSubRecipe(subRecipe.subRecipeId)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-600">
                          {subRecipe.quantity} {subRecipe.unit}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ${subRecipe.totalCost?.toFixed(2)}
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Add Sub-recipe */}
              {isEditing && (
                <div className="mt-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">Agregar sub-receta:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {subRecipes
                        .filter(sr => 
                          sr.name.toLowerCase().includes(subRecipeSearch.toLowerCase()) &&
                          !recipe.subRecipes.find(r => r.subRecipeId === sr.id)
                        )
                        .slice(0, 4)
                        .map(subRecipe => (
                          <button
                            key={subRecipe.id}
                            onClick={() => addSubRecipe(subRecipe.id)}
                            className="p-2 text-left border border-gray-200 rounded hover:bg-gray-50"
                          >
                            <div className="font-medium text-gray-900">{subRecipe.name}</div>
                            <div className="text-xs text-gray-500">${subRecipe.foodCost}/porción</div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Cost Panel */}
        {showCostBreakdown && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Cost Summary */}
              <div className="bg-gradient-to-r from-admin-primary to-admin-primary-dark text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Resumen de Costos</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Costo Total:</span>
                    <span className="text-xl font-bold">
                      <AnimatedCounter
                        value={totalCost}
                        decimals={2}
                        prefix="$"
                      />
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Precio Venta:</span>
                    <span className="font-bold">${recipe.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Food Cost %:</span>
                    <span className={`font-bold ${
                      foodCostPercentage <= 30 ? 'text-green-300' :
                      foodCostPercentage <= 40 ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                      <AnimatedCounter
                        value={foodCostPercentage}
                        decimals={1}
                        suffix="%"
                      />
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose de Costos</h3>
                
                {/* Ingredient Costs */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Ingredientes</h4>
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex justify-between text-sm">
                      <span>{ingredients.find(i => i.id === ingredient.ingredientId)?.name}</span>
                      <span className="font-medium">
                        <AnimatedCounter
                          value={ingredient.totalCost || 0}
                          decimals={2}
                          prefix="$"
                        />
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sub-recipe Costs */}
                {recipe.subRecipes.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-medium text-gray-700">Sub-recetas</h4>
                    {recipe.subRecipes.map((subRecipe, index) => (
                      <div key={subRecipe.id} className="flex justify-between text-sm">
                        <span>{subRecipe.subRecipe.name}</span>
                        <span className="font-medium">
                          <AnimatedCounter
                            value={subRecipe.totalCost || 0}
                            decimals={2}
                            prefix="$"
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cost Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Costos</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Costo por porción:</span>
                    <span className="font-medium">
                      <AnimatedCounter
                        value={totalCost / recipe.servings}
                        decimals={2}
                        prefix="$"
                      />
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Margen de ganancia:</span>
                    <span className={`font-medium ${
                      (recipe.price - totalCost) / recipe.price >= 0.6 ? 'text-green-600' :
                      (recipe.price - totalCost) / recipe.price >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      <AnimatedCounter
                        value={((recipe.price - totalCost) / recipe.price) * 100}
                        decimals={1}
                        suffix="%"
                      />
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Ganancia por porción:</span>
                    <span className="font-medium text-green-600">
                      <AnimatedCounter
                        value={(recipe.price - totalCost) / recipe.servings}
                        decimals={2}
                        prefix="$"
                      />
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h3>
                
                <div className="space-y-2">
                  {foodCostPercentage > 40 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-red-800">Food Cost elevado</div>
                          <div className="text-sm text-red-600">
                            Considera reducir costos o aumentar el precio para mejorar el margen
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {foodCostPercentage <= 30 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-green-800">Excelente Food Cost</div>
                          <div className="text-sm text-green-600">
                            Tu margen de ganancia es saludable
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
