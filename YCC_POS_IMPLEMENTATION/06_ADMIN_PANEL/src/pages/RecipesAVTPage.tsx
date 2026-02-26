import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  BarChart3,
  Target,
  DollarSign,
  Package,
  Clock,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'
import { 
  AVTAnalysis,
  Recipe,
  AVTPeriod,
  AVTCategory,
  AVTAlert
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'
import { AnimatedCounter } from '../components/AnimatedCounter'

// Mock API functions
const fetchAVTAnalysis = async (storeId: string, period: AVTPeriod): Promise<AVTAnalysis[]> => {
  await new Promise(resolve => setTimeout(resolve, 1200))
  return [
    {
      id: 'avt-1',
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
      period: AVTPeriod.MONTHLY,
      theoreticalUsage: 450,
      actualUsage: 480,
      variance: 30,
      variancePercentage: 6.7,
      theoreticalCost: 12150.00,
      actualCost: 13680.00,
      costVariance: 1530.00,
      costVariancePercentage: 12.6,
      salesVolume: 450,
      wastePercentage: 3.2,
      portionControlIssues: [
        {
          ingredientId: 'ing-1',
          ingredient: 'ing-1',
          expectedPortion: 150,
          actualPortion: 165,
          variance: 15,
          variancePercentage: 10.0,
          frequency: 'HIGH',
          impact: 'HIGH'
        },
        {
          ingredientId: 'ing-2',
          ingredient: 'ing-2',
          expectedPortion: 1,
          actualPortion: 1.1,
          variance: 0.1,
          variancePercentage: 10.0,
          frequency: 'MEDIUM',
          impact: 'MEDIUM'
        }
      ],
      alerts: [
        {
          type: 'HIGH_VARIANCE',
          severity: 'HIGH',
          message: 'Varianza del 6.7% en uso de ingredientes',
          recommendation: 'Revisar porciones y entrenar al personal'
        },
        {
          type: 'WASTE_INCREASE',
          severity: 'MEDIUM',
          message: 'Aumento del desperdicio al 3.2%',
          recommendation: 'Implementar control de porciones más estricto'
        }
      ],
      analysisDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'avt-2',
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
      period: AVTPeriod.MONTHLY,
      theoreticalUsage: 320,
      actualUsage: 310,
      variance: -10,
      variancePercentage: -3.1,
      theoreticalCost: 5440.00,
      actualCost: 5735.00,
      costVariance: 295.00,
      costVariancePercentage: 5.4,
      salesVolume: 320,
      wastePercentage: 1.8,
      portionControlIssues: [
        {
          ingredientId: 'ing-4',
          ingredient: 'ing-4',
          expectedPortion: 200,
          actualPortion: 190,
          variance: -10,
          variancePercentage: -5.0,
          frequency: 'LOW',
          impact: 'LOW'
        }
      ],
      alerts: [
        {
          type: 'POSITIVE_VARIANCE',
          severity: 'LOW',
          message: 'Uso eficiente de ingredientes (-3.1%)',
          recommendation: 'Mantener prácticas actuales'
        }
      ],
      analysisDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'avt-3',
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
      period: AVTPeriod.MONTHLY,
      theoreticalUsage: 680,
      actualUsage: 750,
      variance: 70,
      variancePercentage: 10.3,
      theoreticalCost: 5440.00,
      actualCost: 6375.00,
      costVariance: 935.00,
      costVariancePercentage: 17.2,
      salesVolume: 680,
      wastePercentage: 8.5,
      portionControlIssues: [
        {
          ingredientId: 'ing-6',
          ingredient: 'ing-6',
          expectedPortion: 300,
          actualPortion: 340,
          variance: 40,
          variancePercentage: 13.3,
          frequency: 'HIGH',
          impact: 'HIGH'
        }
      ],
      alerts: [
        {
          type: 'HIGH_VARIANCE',
          severity: 'HIGH',
          message: 'Varianza crítica del 10.3% en papas',
          recommendation: 'Revisar porciones inmediatamente'
        },
        {
          type: 'WASTE_CRITICAL',
          severity: 'HIGH',
          message: 'Desperdicio elevado al 8.5%',
          recommendation: 'Implementar control de calidad'
        }
      ],
      analysisDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

export function RecipesAVTPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [selectedPeriod, setSelectedPeriod] = useState<AVTPeriod>(AVTPeriod.MONTHLY)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set())

  // Queries
  const { data: avtAnalysis, isLoading: isLoadingAnalysis } = useQuery({
    queryKey: ['avt-analysis', currentStore?.id, selectedPeriod],
    queryFn: () => fetchAVTAnalysis(currentStore?.id || '', selectedPeriod),
    refetchInterval: 30000
  })

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (!avtAnalysis) return null

    const totalRecipes = avtAnalysis.length
    const avgVariance = avtAnalysis.reduce((sum, avt) => sum + avt.variancePercentage, 0) / totalRecipes
    const avgCostVariance = avtAnalysis.reduce((sum, avt) => sum + avt.costVariancePercentage, 0) / totalRecipes
    const totalCostVariance = avtAnalysis.reduce((sum, avt) => sum + avt.costVariance, 0)
    const avgWaste = avtAnalysis.reduce((sum, avt) => sum + avt.wastePercentage, 0) / totalRecipes
    const highVarianceRecipes = avtAnalysis.filter(avt => Math.abs(avt.variancePercentage) > 5).length
    const criticalAlerts = avtAnalysis.reduce((sum, avt) => sum + avt.alerts.filter(alert => alert.severity === 'HIGH').length, 0)

    return {
      totalRecipes,
      avgVariance,
      avgCostVariance,
      totalCostVariance,
      avgWaste,
      highVarianceRecipes,
      criticalAlerts
    }
  }

  const summaryMetrics = calculateSummaryMetrics()

  // Filter data
  const filteredAnalysis = avtAnalysis?.filter(avt => {
    const matchesSearch = avt.recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || avt.recipe.category.id === selectedCategory
    return matchesSearch && matchesCategory
  }) || []

  // Get period label
  const getPeriodLabel = (period: AVTPeriod) => {
    switch (period) {
      case AVTPeriod.DAILY: return 'Diario'
      case AVTPeriod.WEEKLY: return 'Semanal'
      case AVTPeriod.MONTHLY: return 'Mensual'
      case AVTPeriod.QUARTERLY: return 'Trimestral'
      case AVTPeriod.YEARLY: return 'Anual'
      default: return 'Mensual'
    }
  }

  // Get variance status
  const getVarianceStatus = (variance: number) => {
    const absVariance = Math.abs(variance)
    if (absVariance <= 2) return { status: 'Excelente', color: 'text-green-600', bg: 'bg-green-100', icon: TrendingDown }
    if (absVariance <= 5) return { status: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-100', icon: Target }
    if (absVariance <= 10) return { status: 'Atención', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle }
    return { status: 'Crítico', color: 'text-red-600', bg: 'bg-red-100', icon: TrendingUp }
  }

  // Get alert severity color
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'text-blue-600 bg-blue-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Toggle alert expansion
  const toggleAlertExpansion = (recipeId: string) => {
    const newExpanded = new Set(expandedAlerts)
    if (newExpanded.has(recipeId)) {
      newExpanded.delete(recipeId)
    } else {
      newExpanded.add(recipeId)
    }
    setExpandedAlerts(newExpanded)
  }

  if (isLoadingAnalysis) {
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
            AVT - Actual vs Teórico
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Análisis de variación entre uso teórico y real de ingredientes
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as AVTPeriod)}
            className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          >
            <option value={AVTPeriod.DAILY}>Diario</option>
            <option value={AVTPeriod.WEEKLY}>Semanal</option>
            <option value={AVTPeriod.MONTHLY}>Mensual</option>
            <option value={AVTPeriod.QUARTERLY}>Trimestral</option>
            <option value={AVTPeriod.YEARLY}>Anual</option>
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
                <p className="text-sm text-admin-text-secondary">Varianza Promedio</p>
                <p className="text-2xl font-bold text-admin-text">
                  <AnimatedCounter
                    value={summaryMetrics.avgVariance}
                    decimals={1}
                    suffix="%"
                  />
                </p>
              </div>
              <div className="p-3 bg-admin-primary/10 rounded-lg">
                <Target className="w-6 h-6 text-admin-primary" />
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-admin-text-secondary">Varianza de Costo</p>
                <p className="text-2xl font-bold text-admin-text">
                  <AnimatedCounter
                    value={summaryMetrics.avgCostVariance}
                    decimals={1}
                    suffix="%"
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
                <p className="text-sm text-admin-text-secondary">Pérdida Total</p>
                <p className="text-2xl font-bold text-admin-text">
                  <AnimatedCounter
                    value={summaryMetrics.totalCostVariance}
                    decimals={0}
                    prefix="$"
                  />
                </p>
              </div>
              <div className="p-3 bg-admin-danger/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-admin-danger" />
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-admin-text-secondary">Alertas Críticas</p>
                <p className="text-2xl font-bold text-admin-text">
                  {summaryMetrics.criticalAlerts}
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
          <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
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

      {/* AVT Analysis Table */}
      <div className="admin-card overflow-hidden">
        <div className="p-6 border-b border-admin-border">
          <h2 className="text-lg font-semibold text-admin-text">Análisis AVT</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Receta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Uso Teórico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Uso Real
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Varianza %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Varianza Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Desperdicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Alertas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-admin-text-secondary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-admin-border">
              {filteredAnalysis.map((avt, index) => {
                const varianceStatus = getVarianceStatus(avt.variancePercentage)
                const hasCriticalAlerts = avt.alerts.some(alert => alert.severity === 'HIGH')

                return (
                  <motion.tr
                    key={avt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-admin-text">
                          {avt.recipe.name}
                        </div>
                        <div className="text-sm text-admin-text-secondary">
                          {avt.recipe.category.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-text">
                        {avt.theoreticalUsage}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-text">
                        {avt.actualUsage}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1
                        ${varianceStatus.bg} ${varianceStatus.color}
                      `}>
                        {React.createElement(varianceStatus.icon, { className: 'w-3 h-3' })}
                        <span>
                          <AnimatedCounter
                            value={avt.variancePercentage}
                            decimals={1}
                            suffix="%"
                          />
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-text">
                        <AnimatedCounter
                          value={avt.costVariancePercentage}
                          decimals={1}
                          suffix="%"
                        />
                      </div>
                      <div className="text-xs text-admin-text-secondary">
                        <AnimatedCounter
                          value={avt.costVariance}
                          decimals={0}
                          prefix="$"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-admin-text">
                        <AnimatedCounter
                          value={avt.wastePercentage}
                          decimals={1}
                          suffix="%"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {avt.alerts.slice(0, 2).map((alert, alertIndex) => (
                          <div
                            key={alertIndex}
                            className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${getAlertSeverityColor(alert.severity)}
                            `}
                          >
                            {alert.severity === 'HIGH' && '⚠️'}
                            {alert.severity === 'MEDIUM' && '⚡'}
                            {alert.severity === 'LOW' && 'ℹ️'}
                          </div>
                        ))}
                        {avt.alerts.length > 2 && (
                          <div className="text-xs text-admin-text-secondary">
                            +{avt.alerts.length - 2}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-admin-text">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowDetails(showDetails === avt.id ? null : avt.id)}
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
                const avt = avtAnalysis.find(a => a.id === showDetails)
                
                if (!avt) return null

                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Análisis AVT Detallado: {avt.recipe.name}
                      </h3>
                      <button
                        onClick={() => setShowDetails(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Usage Analysis */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Análisis de Uso</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900">Uso Teórico</div>
                            <div className="font-medium text-gray-900">{avt.theoreticalUsage}</div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900">Uso Real</div>
                            <div className="font-medium text-gray-900">{avt.actualUsage}</div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900">Varianza</div>
                            <div className="font-medium text-gray-900">{avt.variance}</div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900">Volumen de Ventas</div>
                            <div className="font-medium text-gray-900">{avt.salesVolume}</div>
                          </div>
                        </div>
                      </div>

                      {/* Cost Analysis */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Análisis de Costos</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900">Costo Teórico</div>
                            <div className="font-medium text-gray-900">
                              <AnimatedCounter
                                value={avt.theoreticalCost}
                                decimals={0}
                                prefix="$"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900">Costo Real</div>
                            <div className="font-medium text-gray-900">
                              <AnimatedCounter
                                value={avt.actualCost}
                                decimals={0}
                                prefix="$"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <div className="font-medium text-red-900">Varianza de Costo</div>
                            <div className="font-medium text-red-900">
                              <AnimatedCounter
                                value={avt.costVariance}
                                decimals={0}
                                prefix="$"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                            <div className="font-medium text-yellow-900">Desperdicio</div>
                            <div className="font-medium text-yellow-900">
                              <AnimatedCounter
                                value={avt.wastePercentage}
                                decimals={1}
                                suffix="%"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Portion Control Issues */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Problemas de Control de Porciones</h4>
                      <div className="space-y-2">
                        {avt.portionControlIssues.map((issue, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">
                                Ingrediente {index + 1}
                              </div>
                              <div className="text-sm text-gray-500">
                                Esperado: {issue.expectedPortion} | Real: {issue.actualPortion}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {issue.variance > 0 ? '+' : ''}{issue.variancePercentage.toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-500">
                                {issue.frequency} | {issue.impact}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alerts */}
                    <div className="mt-6">
                      <button
                        onClick={() => toggleAlertExpansion(avt.id)}
                        className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <h4 className="font-semibold text-gray-900">Alertas ({avt.alerts.length})</h4>
                        {expandedAlerts.has(avt.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedAlerts.has(avt.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2 space-y-2"
                          >
                            {avt.alerts.map((alert, index) => (
                              <div
                                key={index}
                                className={`
                                  p-3 rounded-lg border
                                  ${alert.severity === 'HIGH' ? 'bg-red-50 border-red-200' :
                                    alert.severity === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                                    'bg-blue-50 border-blue-200'}
                                `}
                              >
                                <div className="flex items-start space-x-2">
                                  <Info className="w-4 h-4 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {alert.type}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {alert.message}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      <strong>Recomendación:</strong> {alert.recommendation}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
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
