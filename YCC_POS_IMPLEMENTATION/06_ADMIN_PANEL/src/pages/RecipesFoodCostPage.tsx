import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  Eye,
  PieChart,
  BarChart3,
  Target,
  ChefHat,
  Calculator,
  Search
} from 'lucide-react'
import { 
  FoodCostAnalysis,
  Recipe,
  FoodCostPeriod,
  RecipePerformanceMetrics
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'
import { AnimatedCounter } from '../components/AnimatedCounter'

// Mock API functions
const fetchFoodCostAnalysis = async (storeId: string, period: FoodCostPeriod): Promise<FoodCostAnalysis[]> => {
  await new Promise(resolve => setTimeout(resolve, 1200))
  return [
    {
      id: 'fca-1',
      recipeId: 'recipe-1',
      recipe: {
        id: 'recipe-1',
        name: 'Hamburguesa Clásica',
        description: 'Nuestra hamburguesa clásica con carne premium',
        category: { id: 'cat-1', name: 'Hamburguesas', description: 'Todas nuestras hamburguesas', order: 1, isActive: true },
        prepTime: 15,
        cookTime: 10,
        servings: 1,
        difficulty: 'EASY' as any,
        isActive: true,
        price: 85.00,
        foodCost: 28.50,
        foodCostPercentage: 33.5,
        theoreticalCost: 27.00,
        ingredients: [],
        subRecipes: [],
        instructions: [],
        allergens: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      storeId,
      theoreticalCost: 27.00,
      actualCost: 28.50,
      variance: 1.50,
      variancePercentage: 5.6,
      ingredientCosts: [
        {
          ingredientId: 'ing-1',
          ingredient: 'ing-1',
          quantity: 150,
          unit: 'g',
          unitCost: 0.80,
          totalCost: 120.00,
          costPercentage: 42.1,
          lastUpdated: new Date()
        },
        {
          ingredientId: 'ing-2',
          ingredient: 'ing-2',
          quantity: 1,
          unit: 'pieza',
          unitCost: 8.00,
          totalCost: 8.00,
          costPercentage: 2.8,
          lastUpdated: new Date()
        },
        {
          ingredientId: 'ing-3',
          ingredient: 'ing-3',
          quantity: 30,
          unit: 'g',
          unitCost: 0.15,
          totalCost: 4.50,
          costPercentage: 1.6,
          lastUpdated: new Date()
        }
      ],
      subRecipeCosts: [],
      laborCost: 5.00,
      overheadCost: 3.00,
      totalCost: 28.50,
      targetFoodCostPercentage: 30.0,
      actualFoodCostPercentage: 33.5,
      analysisDate: new Date(),
      period: FoodCostPeriod.MONTHLY
    },
    {
      id: 'fca-2',
      recipeId: 'recipe-2',
      recipe: {
        id: 'recipe-2',
        name: 'Ensalada César',
        description: 'Ensalada César clásica con pollo grillado',
        category: { id: 'cat-2', name: 'Ensaladas', description: 'Ensaladas frescas y saludables', order: 2, isActive: true },
        prepTime: 20,
        cookTime: 15,
        servings: 1,
        difficulty: 'EASY' as any,
        isActive: true,
        price: 65.00,
        foodCost: 18.50,
        foodCostPercentage: 28.5,
        theoreticalCost: 17.00,
        ingredients: [],
        subRecipes: [],
        instructions: [],
        allergens: [],
        createdBy: 'user-2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      storeId,
      theoreticalCost: 17.00,
      actualCost: 18.50,
      variance: 1.50,
      variancePercentage: 8.8,
      ingredientCosts: [
        {
          ingredientId: 'ing-4',
          ingredient: 'ing-4',
          quantity: 200,
          unit: 'g',
          unitCost: 0.15,
          totalCost: 30.00,
          costPercentage: 46.2,
          lastUpdated: new Date()
        },
        {
          ingredientId: 'ing-5',
          ingredient: 'ing-5',
          quantity: 150,
          unit: 'g',
          unitCost: 0.12,
          totalCost: 18.00,
          costPercentage: 27.7,
          lastUpdated: new Date()
        }
      ],
      subRecipeCosts: [],
      laborCost: 3.00,
      overheadCost: 2.00,
      totalCost: 18.50,
      targetFoodCostPercentage: 25.0,
      actualFoodCostPercentage: 28.5,
      analysisDate: new Date(),
      period: FoodCostPeriod.MONTHLY
    },
    {
      id: 'fca-3',
      recipeId: 'recipe-3',
      recipe: {
        id: 'recipe-3',
        name: 'Papas Fritas',
        description: 'Papas fritas crujientes con sal y especias',
        category: { id: 'cat-3', name: 'Acompañamientos', description: 'Guarniciones y acompañamientos', order: 3, isActive: true },
        prepTime: 10,
        cookTime: 15,
        servings: 1,
        difficulty: 'EASY' as any,
        isActive: true,
        price: 35.00,
        foodCost: 8.50,
        foodCostPercentage: 24.3,
        theoreticalCost: 8.00,
        ingredients: [],
        subRecipes: [],
        instructions: [],
        allergens: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      storeId,
      theoreticalCost: 8.00,
      actualCost: 8.50,
      variance: 0.50,
      variancePercentage: 6.3,
      ingredientCosts: [
        {
          ingredientId: 'ing-6',
          ingredient: 'ing-6',
          quantity: 300,
          unit: 'g',
          unitCost: 0.02,
          totalCost: 6.00,
          costPercentage: 70.6,
          lastUpdated: new Date()
        }
      ],
      subRecipeCosts: [],
      laborCost: 1.50,
      overheadCost: 1.00,
      totalCost: 8.50,
      targetFoodCostPercentage: 20.0,
      actualFoodCostPercentage: 24.3,
      analysisDate: new Date(),
      period: FoodCostPeriod.MONTHLY
    }
  ]
}

const fetchRecipePerformance = async (storeId: string, period: FoodCostPeriod): Promise<RecipePerformanceMetrics[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      recipeId: 'recipe-1',
      recipe: {
        id: 'recipe-1',
        name: 'Hamburguesa Clásica',
        description: 'Nuestra hamburguesa clásica con carne premium',
        category: { id: 'cat-1', name: 'Hamburguesas', description: 'Todas nuestras hamburguesas', order: 1, isActive: true },
        prepTime: 15,
        cookTime: 10,
        servings: 1,
        difficulty: 'EASY' as any,
        isActive: true,
        price: 85.00,
        foodCost: 28.50,
        foodCostPercentage: 33.5,
        theoreticalCost: 27.00,
        ingredients: [],
        subRecipes: [],
        instructions: [],
        allergens: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      period: FoodCostPeriod.MONTHLY,
      totalOrders: 450,
      totalRevenue: 38250.00,
      totalCost: 12825.00,
      grossProfit: 25425.00,
      profitMargin: 66.5,
      foodCostVariance: 5.6,
      popularityScore: 95,
      averageOrderSize: 1.2,
      peakHours: [12, 13, 19, 20],
      topSellingDays: ['Sábado', 'Viernes', 'Domingo']
    },
    {
      recipeId: 'recipe-2',
      recipe: {
        id: 'recipe-2',
        name: 'Ensalada César',
        description: 'Ensalada César clásica con pollo grillado',
        category: { id: 'cat-2', name: 'Ensaladas', description: 'Ensaladas frescas y saludables', order: 2, isActive: true },
        prepTime: 20,
        cookTime: 15,
        servings: 1,
        difficulty: 'EASY' as any,
        isActive: true,
        price: 65.00,
        foodCost: 18.50,
        foodCostPercentage: 28.5,
        theoreticalCost: 17.00,
        ingredients: [],
        subRecipes: [],
        instructions: [],
        allergens: [],
        createdBy: 'user-2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      period: FoodCostPeriod.MONTHLY,
      totalOrders: 320,
      totalRevenue: 20800.00,
      totalCost: 5920.00,
      grossProfit: 14880.00,
      profitMargin: 71.5,
      foodCostVariance: 8.8,
      popularityScore: 85,
      averageOrderSize: 1.0,
      peakHours: [12, 13, 20],
      topSellingDays: ['Lunes', 'Miércoles', 'Viernes']
    },
    {
      recipeId: 'recipe-3',
      recipe: {
        id: 'recipe-3',
        name: 'Papas Fritas',
        description: 'Papas fritas crujientes con sal y especias',
        category: { id: 'cat-3', name: 'Acompañamientos', description: 'Guarniciones y acompañamientos', order: 3, isActive: true },
        prepTime: 10,
        cookTime: 15,
        servings: 1,
        difficulty: 'EASY' as any,
        isActive: true,
        price: 35.00,
        foodCost: 8.50,
        foodCostPercentage: 24.3,
        theoreticalCost: 8.00,
        ingredients: [],
        subRecipes: [],
        instructions: [],
        allergens: [],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      period: FoodCostPeriod.MONTHLY,
      totalOrders: 680,
      totalRevenue: 23800.00,
      totalCost: 5780.00,
      grossProfit: 18020.00,
      profitMargin: 75.7,
      foodCostVariance: 6.3,
      popularityScore: 78,
      averageOrderSize: 1.5,
      peakHours: [12, 13, 19, 20],
      topSellingDays: ['Viernes', 'Sábado', 'Domingo']
    }
  ]
}

export function RecipesFoodCostPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [selectedPeriod, setSelectedPeriod] = useState<FoodCostPeriod>(FoodCostPeriod.MONTHLY)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  // Queries
  const { data: foodCostAnalysis, isLoading: isLoadingAnalysis } = useQuery({
    queryKey: ['food-cost-analysis', currentStore?.id, selectedPeriod],
    queryFn: () => fetchFoodCostAnalysis(currentStore?.id || '', selectedPeriod),
    refetchInterval: 30000
  })

  const { data: performanceMetrics, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['recipe-performance', currentStore?.id, selectedPeriod],
    queryFn: () => fetchRecipePerformance(currentStore?.id || '', selectedPeriod),
    refetchInterval: 30000
  })

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (!foodCostAnalysis || !performanceMetrics) return null

    const totalRecipes = foodCostAnalysis.length
    const avgFoodCost = foodCostAnalysis.reduce((sum, fca) => sum + fca.actualFoodCostPercentage, 0) / totalRecipes
    const avgVariance = foodCostAnalysis.reduce((sum, fca) => sum + fca.variancePercentage, 0) / totalRecipes
    const totalRevenue = performanceMetrics.reduce((sum, pm) => sum + pm.totalRevenue, 0)
    const totalCost = performanceMetrics.reduce((sum, pm) => sum + pm.totalCost, 0)
    const totalProfit = performanceMetrics.reduce((sum, pm) => sum + pm.grossProfit, 0)
    const avgMargin = performanceMetrics.reduce((sum, pm) => sum + pm.profitMargin, 0) / performanceMetrics.length

    return {
      totalRecipes,
      avgFoodCost,
      avgVariance,
      totalRevenue,
      totalCost,
      totalProfit,
      avgMargin,
      highCostRecipes: foodCostAnalysis.filter(fca => fca.actualFoodCostPercentage > 35).length,
      lowMarginRecipes: performanceMetrics.filter(pm => pm.profitMargin < 60).length
    }
  }

  const summaryMetrics = calculateSummaryMetrics()

  // Filter data
  const filteredAnalysis = foodCostAnalysis?.filter(fca => {
    const matchesSearch = fca.recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || fca.recipe.category.id === selectedCategory
    return matchesSearch && matchesCategory
  }) || []

  const filteredPerformance = performanceMetrics?.filter(pm => {
    const matchesSearch = pm.recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || pm.recipe.category.id === selectedCategory
    return matchesSearch && matchesCategory
  }) || []

  // Get period label
  const getPeriodLabel = (period: FoodCostPeriod) => {
    switch (period) {
      case FoodCostPeriod.DAILY: return 'Diario'
      case FoodCostPeriod.WEEKLY: return 'Semanal'
      case FoodCostPeriod.MONTHLY: return 'Mensual'
      case FoodCostPeriod.QUARTERLY: return 'Trimestral'
      case FoodCostPeriod.YEARLY: return 'Anual'
      default: return 'Mensual'
    }
  }

  // Get food cost status
  const getFoodCostStatus = (percentage: number) => {
    if (percentage <= 25) return { status: 'Excelente', color: 'text-green-600', bg: 'bg-green-100', icon: TrendingDown }
    if (percentage <= 30) return { status: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-100', icon: Target }
    if (percentage <= 35) return { status: 'Atención', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle }
    return { status: 'Crítico', color: 'text-red-600', bg: 'bg-red-100', icon: TrendingUp }
  }

  // Get margin status
  const getMarginStatus = (margin: number) => {
    if (margin >= 70) return { status: 'Excelente', color: 'text-green-600', bg: 'bg-green-100', icon: TrendingUp }
    if (margin >= 60) return { status: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-100', icon: Target }
    if (margin >= 50) return { status: 'Atención', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle }
    return { status: 'Crítico', color: 'text-red-600', bg: 'bg-red-100', icon: TrendingDown }
  }

  if (isLoadingAnalysis || isLoadingPerformance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

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
            Food Cost Dashboard
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Análisis de costos de recetas y rentabilidad
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as FoodCostPeriod)}
            className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          >
            <option value={FoodCostPeriod.DAILY}>Diario</option>
            <option value={FoodCostPeriod.WEEKLY}>Semanal</option>
            <option value={FoodCostPeriod.MONTHLY}>Mensual</option>
            <option value={FoodCostPeriod.QUARTERLY}>Trimestral</option>
            <option value={FoodCostPeriod.YEARLY}>Anual</option>
          </select>

          <button className="flex items-center space-x-2 px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-border transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-admin-text-secondary">Food Cost Promedio</p>
                <p className="text-2xl font-bold text-admin-text">
                  <AnimatedCounter
                    value={summaryMetrics.avgFoodCost}
                    decimals={1}
                    suffix="%"
                  />
                </p>
              </div>
              <div className="p-3 bg-admin-primary/10 rounded-lg">
                <Calculator className="w-6 h-6 text-admin-primary" />
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-admin-text-secondary">Margen Promedio</p>
                <p className="text-2xl font-bold text-admin-text">
                  <AnimatedCounter
                    value={summaryMetrics.avgMargin}
                    decimals={1}
                    suffix="%"
                  />
                </p>
              </div>
              <div className="p-3 bg-admin-success/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-admin-success" />
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-admin-text-secondary">Utilidad Total</p>
                <p className="text-2xl font-bold text-admin-text">
                  <AnimatedCounter
                    value={summaryMetrics.totalProfit}
                    decimals={0}
                    prefix="$"
                  />
                </p>
              </div>
              <div className="p-3 bg-admin-warning/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-admin-warning" />
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-admin-text-secondary">Recetas Críticas</p>
                <p className="text-2xl font-bold text-admin-text">
                  {summaryMetrics.highCostRecipes + summaryMetrics.lowMarginRecipes}
                </p>
              </div>
              <div className="p-3 bg-admin-danger/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-admin-danger" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
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
      </div>

      {/* Food Cost Analysis Table */}
      <div className="admin-card overflow-hidden">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-lg font-semibold text-admin-text">Análisis de Food Cost</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Receta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Costo Real
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Food Cost %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Variancia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Margen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Utilidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-admin-border">
              {filteredAnalysis.map((analysis, index) => {
                const performance = filteredPerformance.find(pm => pm.recipeId === analysis.recipeId)
                const foodCostStatus = getFoodCostStatus(analysis.actualFoodCostPercentage)
                const marginStatus = performance ? getMarginStatus(performance.profitMargin) : null

                return (
                  <motion.tr
                    key={analysis.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-admin-text">
                          {analysis.recipe.name}
                        </div>
                        <div className="text-sm text-admin-text-secondary">
                          {analysis.recipe.category.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-text">
                        ${analysis.recipe.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-text">
                        <AnimatedCounter
                          value={analysis.actualCost}
                          decimals={2}
                          prefix="$"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1
                        ${foodCostStatus.bg} ${foodCostStatus.color}
                      `}>
                        {React.createElement(foodCostStatus.icon, { className: 'w-3 h-3' })}
                        <span>
                          <AnimatedCounter
                            value={analysis.actualFoodCostPercentage}
                            decimals={1}
                            suffix="%"
                          />
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-text">
                        <AnimatedCounter
                          value={analysis.variancePercentage}
                          decimals={1}
                          suffix="%"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {marginStatus && (
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1
                          ${marginStatus.bg} ${marginStatus.color}
                        `}>
                          {React.createElement(marginStatus.icon, { className: 'w-3 h-3' })}
                          <span>
                            <AnimatedCounter
                              value={performance.profitMargin}
                              decimals={1}
                              suffix="%"
                            />
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {performance && (
                        <div className="text-sm text-admin-text">
                          <AnimatedCounter
                            value={performance.grossProfit}
                            decimals={0}
                            prefix="$"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-text">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowDetails(showDetails === analysis.id ? null : analysis.id)}
                          className="text-admin-primary hover:text-admin-primary-hover"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-admin-primary hover:text-admin-primary-hover">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Analysis Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const analysis = foodCostAnalysis.find(fca => fca.id === showDetails)
                const performance = performanceMetrics.find(pm => pm.recipeId === analysis?.recipeId)
                
                if (!analysis) return null

                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Análisis Detallado: {analysis.recipe.name}
                      </h3>
                      <button
                        onClick={() => setShowDetails(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Cost Breakdown */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Desglose de Costos</h4>
                        <div className="space-y-3">
                          {analysis.ingredientCosts.map((cost, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">
                                  Ingrediente {index + 1}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {cost.quantity} {cost.unit}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  <AnimatedCounter
                                    value={cost.totalCost}
                                    decimals={2}
                                    prefix="$"
                                  />
                                </div>
                                <div className="text-sm text-gray-500">
                                  {cost.costPercentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {analysis.laborCost > 0 && (
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <div className="font-medium text-blue-900">Mano de Obra</div>
                              <div className="font-medium text-blue-900">
                                <AnimatedCounter
                                  value={analysis.laborCost}
                                  decimals={2}
                                  prefix="$"
                                />
                              </div>
                            </div>
                          )}
                          
                          {analysis.overheadCost > 0 && (
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                              <div className="font-medium text-purple-900">Overhead</div>
                              <div className="font-medium text-purple-900">
                                <AnimatedCounter
                                  value={analysis.overheadCost}
                                  decimals={2}
                                  prefix="$"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Métricas de Rendimiento</h4>
                        {performance && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium text-gray-900">Órdenes Totales</div>
                              <div className="font-medium text-gray-900">
                                {performance.totalOrders.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium text-gray-900">Ingresos Totales</div>
                              <div className="font-medium text-gray-900">
                                <AnimatedCounter
                                  value={performance.totalRevenue}
                                  decimals={0}
                                  prefix="$"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium text-gray-900">Costos Totales</div>
                              <div className="font-medium text-gray-900">
                                <AnimatedCounter
                                  value={performance.totalCost}
                                  decimals={0}
                                  prefix="$"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <div className="font-medium text-green-900">Utilidad Bruta</div>
                              <div className="font-medium text-green-900">
                                <AnimatedCounter
                                  value={performance.grossProfit}
                                  decimals={0}
                                  prefix="$"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <div className="font-medium text-blue-900">Puntaje de Popularidad</div>
                              <div className="font-medium text-blue-900">
                                {performance.popularityScore}/100
                              </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium text-gray-900">Tamaño Promedio de Orden</div>
                              <div className="font-medium text-gray-900">
                                {performance.averageOrderSize}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
