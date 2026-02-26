import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  ChefHat,
  Star,
  AlertTriangle
} from 'lucide-react'
import { 
  Recipe, 
  RecipeCreateRequest,
  RecipeUpdateRequest,
  RecipeFilters,
  RecipeDifficulty,
  Allergen
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions
const fetchRecipes = async (filters?: RecipeFilters): Promise<Recipe[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'recipe-1',
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
          recipeId: 'recipe-1',
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
          recipeId: 'recipe-1',
          ingredientId: 'ing-2',
          ingredient: 'ing-2',
          quantity: 1,
          unit: 'pieza',
          unitCost: 8.00,
          totalCost: 8.00,
          isOptional: false,
          notes: 'Pan brioche',
          order: 2
        }
      ],
      subRecipes: [],
      instructions: [
        {
          id: 'inst-1',
          recipeId: 'recipe-1',
          step: 1,
          title: 'Preparar la carne',
          description: 'Formar la hamburguesa y sazonar con sal y pimienta',
          time: 5,
          temperature: 180,
          order: 1
        },
        {
          id: 'inst-2',
          recipeId: 'recipe-1',
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
    },
    {
      id: 'recipe-2',
      name: 'Ensalada César',
      description: 'Ensalada César clásica con pollo grillado, crutons y parmesano',
      category: {
        id: 'cat-2',
        name: 'Ensaladas',
        description: 'Ensaladas frescas y saludables',
        order: 2,
        isActive: true
      },
      imageUrl: '/images/caesar-salad.jpg',
      prepTime: 20,
      cookTime: 15,
      servings: 1,
      difficulty: RecipeDifficulty.EASY,
      isActive: true,
      price: 65.00,
      foodCost: 18.50,
      foodCostPercentage: 28.5,
      theoreticalCost: 17.00,
      ingredients: [
        {
          id: 'ing-3',
          recipeId: 'recipe-2',
          ingredientId: 'ing-3',
          ingredient: 'ing-3',
          quantity: 200,
          unit: 'g',
          unitCost: 0.15,
          totalCost: 30.00,
          isOptional: false,
          notes: 'Lechuga romana fresca',
          order: 1
        },
        {
          id: 'ing-4',
          recipeId: 'recipe-2',
          ingredientId: 'ing-4',
          ingredient: 'ing-4',
          quantity: 150,
          unit: 'g',
          unitCost: 0.12,
          totalCost: 18.00,
          isOptional: false,
          notes: 'Pechuga de pollo',
          order: 2
        }
      ],
      subRecipes: [],
      instructions: [
        {
          id: 'inst-3',
          recipeId: 'recipe-2',
          step: 1,
          title: 'Preparar los ingredientes',
          description: 'Lavar y cortar la lechuga, preparar el pollo',
          time: 10,
          order: 1
        },
        {
          id: 'inst-4',
          recipeId: 'recipe-2',
          step: 2,
          title: 'Cocinar el pollo',
          description: 'Grillar el pollo hasta que esté dorado',
          time: 12,
          temperature: 200,
          order: 2
        }
      ],
      allergens: [Allergen.GLUTEN, Allergen.DAIRY, Allergen.EGGS],
      nutritionalInfo: {
        calories: 320,
        protein: 28,
        carbohydrates: 15,
        fat: 18,
        fiber: 4,
        sugar: 3,
        sodium: 800
      },
      createdBy: 'user-2',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: 'recipe-3',
      name: 'Papas Fritas',
      description: 'Papas fritas crujientes con sal y especias',
      category: {
        id: 'cat-3',
        name: 'Acompañamientos',
        description: 'Guarniciones y acompañamientos',
        order: 3,
        isActive: true
      },
      imageUrl: '/images/french-fries.jpg',
      prepTime: 10,
      cookTime: 15,
      servings: 1,
      difficulty: RecipeDifficulty.EASY,
      isActive: true,
      price: 35.00,
      foodCost: 8.50,
      foodCostPercentage: 24.3,
      theoreticalCost: 8.00,
      ingredients: [
        {
          id: 'ing-5',
          recipeId: 'recipe-3',
          ingredientId: 'ing-5',
          ingredient: 'ing-5',
          quantity: 300,
          unit: 'g',
          unitCost: 0.02,
          totalCost: 6.00,
          isOptional: false,
          notes: 'Papas para freír',
          order: 1
        }
      ],
      subRecipes: [],
      instructions: [
        {
          id: 'inst-5',
          recipeId: 'recipe-3',
          step: 1,
          title: 'Preparar las papas',
          description: 'Cortar las papas en juliana y remojar en agua',
          time: 10,
          order: 1
        },
        {
          id: 'inst-6',
          recipeId: 'recipe-3',
          step: 2,
          title: 'Freír las papas',
          description: 'Freír a 180°C hasta que estén doradas',
          time: 12,
          temperature: 180,
          order: 2
        }
      ],
      allergens: [],
      nutritionalInfo: {
        calories: 280,
        protein: 3,
        carbohydrates: 35,
        fat: 15,
        fiber: 3,
        sugar: 1,
        sodium: 400
      },
      createdBy: 'user-1',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 'recipe-4',
      name: 'Coca Cola 600ml',
      description: 'Refresco de cola clásico',
      category: {
        id: 'cat-4',
        name: 'Bebidas',
        description: 'Bebidas y refrescos',
        order: 4,
        isActive: true
      },
      imageUrl: '/images/coca-cola.jpg',
      prepTime: 2,
      cookTime: 0,
      servings: 1,
      difficulty: RecipeDifficulty.EASY,
      isActive: true,
      price: 30.00,
      foodCost: 12.00,
      foodCostPercentage: 40.0,
      theoreticalCost: 11.50,
      ingredients: [
        {
          id: 'ing-6',
          recipeId: 'recipe-4',
          ingredientId: 'ing-6',
          ingredient: 'ing-6',
          quantity: 600,
          unit: 'ml',
          unitCost: 0.02,
          totalCost: 12.00,
          isOptional: false,
          notes: 'Coca Cola embotellada',
          order: 1
        }
      ],
      subRecipes: [],
      instructions: [
        {
          id: 'inst-7',
          recipeId: 'recipe-4',
          step: 1,
          title: 'Servir',
          description: 'Servir frío con hielo',
          time: 2,
          order: 1
        }
      ],
      allergens: [],
      nutritionalInfo: {
        calories: 240,
        protein: 0,
        carbohydrates: 65,
        fat: 0,
        fiber: 0,
        sugar: 65,
        sodium: 30
      },
      createdBy: 'user-3',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-22')
    },
    {
      id: 'recipe-5',
      name: 'Agua 600ml',
      description: 'Agua purificada embotellada',
      category: {
        id: 'cat-4',
        name: 'Bebidas',
        description: 'Bebidas y refrescos',
        order: 4,
        isActive: true
      },
      imageUrl: '/images/water-bottle.jpg',
      prepTime: 1,
      cookTime: 0,
      servings: 1,
      difficulty: RecipeDifficulty.EASY,
      isActive: true,
      price: 15.00,
      foodCost: 3.00,
      foodCostPercentage: 20.0,
      theoreticalCost: 2.80,
      ingredients: [
        {
          id: 'ing-7',
          recipeId: 'recipe-5',
          ingredientId: 'ing-7',
          ingredient: 'ing-7',
          quantity: 600,
          unit: 'ml',
          unitCost: 0.005,
          totalCost: 3.00,
          isOptional: false,
          notes: 'Agua purificada',
          order: 1
        }
      ],
      subRecipes: [],
      instructions: [
        {
          id: 'inst-8',
          recipeId: 'recipe-5',
          step: 1,
          title: 'Servir',
          description: 'Servir a temperatura ambiente o fría',
          time: 1,
          order: 1
        }
      ],
      allergens: [],
      nutritionalInfo: {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      },
      createdBy: 'user-3',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-25')
    }
  ]
}

const createRecipe = async (data: RecipeCreateRequest): Promise<Recipe> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `recipe-${Date.now()}`,
    ...data,
    ingredients: data.ingredients.map((ing, index) => ({
      ...ing,
      id: `ing-${Date.now()}-${index}`,
      recipeId: `recipe-${Date.now()}`
    })),
    subRecipes: data.subRecipes.map((sub, index) => ({
      ...sub,
      id: `sub-${Date.now()}-${index}`,
      recipeId: `recipe-${Date.now()}`
    })),
    instructions: data.instructions.map((inst, index) => ({
      ...inst,
      id: `inst-${Date.now()}-${index}`,
      recipeId: `recipe-${Date.now()}`
    })),
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
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

const deleteRecipe = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
}

export function RecipesPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<RecipeDifficulty | ''>('')
  const [selectedAllergen, setSelectedAllergen] = useState<Allergen | ''>('')
  const [showInactive, setShowInactive] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)

  // Queries
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', currentStore, searchTerm, selectedCategory, selectedDifficulty, selectedAllergen, showInactive],
    queryFn: () => fetchRecipes({
      search: searchTerm,
      categoryId: selectedCategory || undefined,
      difficulty: selectedDifficulty || undefined,
      allergen: selectedAllergen || undefined,
      isActive: showInactive ? undefined : true
    }),
    refetchInterval: 30000
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      setIsCreateModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecipeUpdateRequest }) =>
      updateRecipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      setEditingRecipe(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    }
  })

  // Handlers
  const handleCreateRecipe = (data: RecipeCreateRequest) => {
    createMutation.mutate(data)
  }

  const handleUpdateRecipe = (data: RecipeUpdateRequest) => {
    if (editingRecipe) {
      updateMutation.mutate({ id: editingRecipe.id, data })
    }
  }

  const handleDeleteRecipe = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta receta?')) {
      deleteMutation.mutate(id)
    }
  }

  // Get difficulty info
  const getDifficultyInfo = (difficulty: RecipeDifficulty) => {
    switch (difficulty) {
      case RecipeDifficulty.EASY:
        return { icon: Star, color: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Fácil' }
      case RecipeDifficulty.MEDIUM:
        return { icon: Star, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Medio' }
      case RecipeDifficulty.HARD:
        return { icon: AlertTriangle, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Difícil' }
      default:
        return { icon: Star, color: 'text-admin-text-secondary', bg: 'bg-admin-border', label: 'Desconocido' }
    }
  }

  // Filter recipes
  const filteredRecipes = recipes?.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || recipe.category.id === selectedCategory
    const matchesDifficulty = !selectedDifficulty || recipe.difficulty === selectedDifficulty
    const matchesAllergen = !selectedAllergen || recipe.allergens.includes(selectedAllergen)
    const matchesActive = showInactive || recipe.isActive
    return matchesSearch && matchesCategory && matchesDifficulty && matchesAllergen && matchesActive
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
            Recetas
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Gestiona recetas y análisis de costos
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Receta</span>
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
          <input
            type="text"
            placeholder="Buscar recetas..."
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
          <option value="cat-1">Hamburguesas</option>
          <option value="cat-2">Ensaladas</option>
          <option value="cat-3">Acompañamientos</option>
          <option value="cat-4">Bebidas</option>
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value as RecipeDifficulty | '')}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todas las dificultades</option>
          <option value={RecipeDifficulty.EASY}>Fácil</option>
          <option value={RecipeDifficulty.MEDIUM}>Medio</option>
          <option value={RecipeDifficulty.HARD}>Difícil</option>
        </select>

        <select
          value={selectedAllergen}
          onChange={(e) => setSelectedAllergen(e.target.value as Allergen | '')}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todos los alérgenos</option>
          <option value={Allergen.GLUTEN}>Gluten</option>
          <option value={Allergen.DAIRY}>Lácteos</option>
          <option value={Allergen.EGGS}>Huevos</option>
          <option value={Allergen.FISH}>Pescado</option>
          <option value={Allergen.SHELLFISH}>Mariscos</option>
          <option value={Allergen.TREE_NUTS}>Frutos secos</option>
          <option value={Allergen.PEANUTS}>Cacahuetes</option>
          <option value={Allergen.SOY}>Soya</option>
          <option value={Allergen.SESAME}>Sésamo</option>
        </select>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-admin-primary border-admin-border rounded focus:ring-admin-primary"
          />
          <span className="text-sm text-admin-text">Mostrar inactivas</span>
        </label>
      </div>

      {/* Recipes Grid */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredRecipes.map((recipe, index) => {
              const difficultyInfo = getDifficultyInfo(recipe.difficulty)
              
              return (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-admin-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-gray-400" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-admin-text">{recipe.name}</h3>
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${difficultyInfo.bg} ${difficultyInfo.color}
                      `}>
                        {React.createElement(difficultyInfo.icon, { className: 'w-3 h-3 inline mr-1' })}
                        {difficultyInfo.label}
                      </div>
                    </div>
                    
                    <p className="text-sm text-admin-text-secondary mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-admin-text-secondary">
                        {recipe.category.name}
                      </span>
                      <span className="text-sm text-admin-text-secondary">
                        {recipe.prepTime + recipe.cookTime} min
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-bold text-admin-text">
                        ${recipe.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-admin-text-secondary">
                        {recipe.servings} porciones
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-admin-text-secondary">
                        Costo: ${recipe.foodCost?.toFixed(2)}
                      </div>
                      <div className={`text-sm font-medium ${
                        recipe.foodCostPercentage && recipe.foodCostPercentage <= 30
                          ? 'text-admin-success'
                          : recipe.foodCostPercentage && recipe.foodCostPercentage <= 40
                          ? 'text-admin-warning'
                          : 'text-admin-danger'
                      }`}>
                        {recipe.foodCostPercentage?.toFixed(1)}%
                      </div>
                    </div>
                    
                    {/* Allergens */}
                    {recipe.allergens.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.allergens.slice(0, 3).map(allergen => (
                          <span key={allergen} className="px-2 py-1 bg-admin-warning/10 text-admin-warning text-xs rounded-full">
                            {allergen}
                          </span>
                        ))}
                        {recipe.allergens.length > 3 && (
                          <span className="px-2 py-1 bg-admin-border text-admin-text-secondary text-xs rounded-full">
                            +{recipe.allergens.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingRecipe(recipe)}
                        className="p-2 hover:bg-admin-border rounded transition-colors"
                      >
                        <Eye className="w-4 h-4 text-admin-text" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="p-2 hover:bg-admin-danger/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-admin-danger" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-admin-border rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-8 h-8 text-admin-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
              {searchTerm ? 'No se encontraron recetas' : 'No hay recetas'}
            </h3>
            <p className="text-admin-text-secondary mb-4">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'Crea tu primera receta para empezar'
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
                <span>Crear Receta</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            {recipes?.length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Total Recetas</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-success">
            {recipes?.filter(r => r.isActive).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Activas</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-warning">
            {recipes?.filter(r => r.foodCostPercentage && r.foodCostPercentage > 40).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Costo > 40%</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-primary">
            ${recipes?.reduce((sum, recipe) => sum + (recipe.price || 0), 0).toFixed(2)}
          </h3>
          <p className="text-sm text-admin-text-secondary">Valor Total</p>
        </div>
      </div>

      {/* Simple Create Modal */}
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Receta</h2>
              <p className="text-gray-600 mb-4">
                Formulario de creación de receta (placeholder - implementar formulario completo)
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
                    handleCreateRecipe({
                      name: 'Nueva Receta',
                      description: 'Descripción de la receta',
                      categoryId: 'cat-1',
                      prepTime: 15,
                      cookTime: 10,
                      servings: 1,
                      difficulty: RecipeDifficulty.EASY,
                      price: 50.00,
                      ingredients: [],
                      subRecipes: [],
                      instructions: [],
                      allergens: []
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
