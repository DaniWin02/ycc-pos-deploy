import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Eye, ChefHat, X } from 'lucide-react'
import api from '../services/api'

interface Recipe {
  id: string
  menuItemId: string
  name?: string
  description?: string
  instructions?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  ingredients?: any[]
}

export const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      const data = await api.get<Recipe[]>('/api/recipes')
      setRecipes(data)
    } catch (error) {
      console.error('Error cargando recetas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Recetas</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} />
          Nueva Receta
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar recetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando recetas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ChefHat className="text-orange-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{recipe.name || 'Sin nombre'}</h3>
                  {recipe.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                {recipe.prepTime && (
                  <div>
                    <span className="text-gray-500">Prep:</span>
                    <span className="ml-1 font-medium">{recipe.prepTime} min</span>
                  </div>
                )}
                {recipe.cookTime && (
                  <div>
                    <span className="text-gray-500">Cocción:</span>
                    <span className="ml-1 font-medium">{recipe.cookTime} min</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Porciones:</span>
                    <span className="ml-1 font-medium">{recipe.servings}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedRecipe(recipe)}
                className="w-full bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <Eye size={16} />
                Ver Detalles
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {filteredRecipes.length === 0 && !loading && (
        <div className="text-center py-12">
          <ChefHat className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No se encontraron recetas</p>
        </div>
      )}

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Detalle de Receta</h2>
                <button onClick={() => setSelectedRecipe(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedRecipe.name}</h3>
                  {selectedRecipe.description && (
                    <p className="text-gray-600 mt-2">{selectedRecipe.description}</p>
                  )}
                </div>
                {selectedRecipe.instructions && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Instrucciones</h4>
                    <p className="text-gray-600 whitespace-pre-line">{selectedRecipe.instructions}</p>
                  </div>
                )}
                {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Ingredientes</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedRecipe.ingredients.map((ing: any, idx: number) => (
                        <li key={idx} className="text-gray-600">
                          {ing.name || ing.ingredientId} - {ing.quantity} {ing.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
