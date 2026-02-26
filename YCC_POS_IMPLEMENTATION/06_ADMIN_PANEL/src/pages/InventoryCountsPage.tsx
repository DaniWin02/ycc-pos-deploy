import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Save,
  Eye
} from 'lucide-react'
import { 
  PhysicalCount, 
  PhysicalCountStatus,
  PhysicalCountCreateRequest,
  PhysicalCountFilters,
  PhysicalCountItem
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions
const fetchPhysicalCounts = async (filters?: PhysicalCountFilters): Promise<PhysicalCount[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'count-1',
      countNumber: 'COUNT-2024-001',
      storeId: 'store-1',
      status: PhysicalCountStatus.COMPLETED,
      countDate: new Date('2024-01-15'),
      startedAt: new Date('2024-01-15T08:00:00'),
      completedAt: new Date('2024-01-15T10:30:00'),
      countedBy: 'user-1',
      reviewedBy: 'user-2',
      notes: 'Conteo mensual de enero',
      varianceAmount: 125.50,
      variancePercentage: 2.3,
      totalItems: 150,
      countedItems: 150,
      items: [
        {
          id: 'count-item-1',
          physicalCountId: 'count-1',
          ingredientId: 'ing-1',
          systemStock: 15.5,
          countedStock: 16.0,
          variance: 0.5,
          variancePercentage: 3.2,
          unitCost: 120.00,
          varianceValue: 60.00,
          notes: 'Ajuste por medición exacta'
        },
        {
          id: 'count-item-2',
          physicalCountId: 'count-1',
          ingredientId: 'ing-2',
          systemStock: 45,
          countedStock: 43,
          variance: -2,
          variancePercentage: -4.4,
          unitCost: 8.00,
          varianceValue: -16.00,
          notes: 'Faltante en inventario'
        }
      ]
    },
    {
      id: 'count-2',
      countNumber: 'COUNT-2024-002',
      storeId: 'store-1',
      status: PhysicalCountStatus.IN_PROGRESS,
      countDate: new Date('2024-01-20'),
      startedAt: new Date('2024-01-20T09:00:00'),
      completedAt: undefined,
      countedBy: 'user-1',
      reviewedBy: undefined,
      notes: 'Conteo semanal de productos frescos',
      varianceAmount: 0,
      variancePercentage: 0,
      totalItems: 25,
      countedItems: 18,
      items: []
    },
    {
      id: 'count-3',
      countNumber: 'COUNT-2024-003',
      storeId: 'store-1',
      status: PhysicalCountStatus.DRAFT,
      countDate: new Date('2024-01-25'),
      startedAt: undefined,
      completedAt: undefined,
      countedBy: undefined,
      reviewedBy: undefined,
      notes: 'Conteo de fin de mes',
      varianceAmount: 0,
      variancePercentage: 0,
      totalItems: 200,
      countedItems: 0,
      items: []
    }
  ]
}

const createPhysicalCount = async (data: PhysicalCountCreateRequest): Promise<PhysicalCount> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `count-${Date.now()}`,
    countNumber: `COUNT-2024-${Date.now()}`,
    ...data,
    status: PhysicalCountStatus.DRAFT,
    varianceAmount: 0,
    variancePercentage: 0,
    totalItems: data.items.length,
    countedItems: 0,
    items: data.items.map(item => ({
      ...item,
      id: `count-item-${Date.now()}-${Math.random()}`,
      variance: 0,
      variancePercentage: 0,
      varianceValue: 0
    }))
  }
}

const updatePhysicalCount = async (id: string, data: Partial<PhysicalCount>): Promise<PhysicalCount> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id,
    countNumber: 'COUNT-2024-001',
    storeId: 'store-1',
    status: PhysicalCountStatus.COMPLETED,
    countDate: new Date(),
    startedAt: new Date(),
    completedAt: new Date(),
    countedBy: 'user-1',
    reviewedBy: 'user-2',
    notes: 'Updated count',
    varianceAmount: 0,
    variancePercentage: 0,
    totalItems: 0,
    countedItems: 0,
    items: []
  }
}

const deletePhysicalCount = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
}

export function InventoryCountsPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<PhysicalCountStatus | ''>('')
  const [selectedDateFrom, setSelectedDateFrom] = useState('')
  const [selectedDateTo, setSelectedDateTo] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedCount, setSelectedCount] = useState<PhysicalCount | null>(null)
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardData, setWizardData] = useState<PhysicalCountCreateRequest | null>(null)

  // Queries
  const { data: counts, isLoading } = useQuery({
    queryKey: ['physical-counts', currentStore, searchTerm, selectedStatus, selectedDateFrom, selectedDateTo],
    queryFn: () => fetchPhysicalCounts({
      storeId: currentStore?.id,
      status: selectedStatus || undefined,
      dateFrom: selectedDateFrom ? new Date(selectedDateFrom) : undefined,
      dateTo: selectedDateTo ? new Date(selectedDateTo) : undefined
    }),
    refetchInterval: 30000
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createPhysicalCount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physical-counts'] })
      setIsCreateModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PhysicalCount> }) =>
      updatePhysicalCount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physical-counts'] })
      setSelectedCount(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deletePhysicalCount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physical-counts'] })
    }
  })

  // Handlers
  const handleCreateCount = (data: PhysicalCountCreateRequest) => {
    createMutation.mutate(data)
  }

  const handleUpdateCount = (data: Partial<PhysicalCount>) => {
    if (selectedCount) {
      updateMutation.mutate({ id: selectedCount.id, data })
    }
  }

  const handleDeleteCount = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este conteo?')) {
      deleteMutation.mutate(id)
    }
  }

  const startWizard = () => {
    setWizardStep(1)
    setWizardData({
      storeId: currentStore?.id || '',
      countDate: new Date(),
      notes: '',
      items: []
    })
    setIsWizardOpen(true)
  }

  const nextWizardStep = () => {
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1)
    }
  }

  const prevWizardStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1)
    }
  }

  const finishWizard = () => {
    if (wizardData) {
      handleCreateCount(wizardData)
      setIsWizardOpen(false)
      setWizardStep(1)
      setWizardData(null)
    }
  }

  // Get status info
  const getStatusInfo = (status: PhysicalCountStatus) => {
    switch (status) {
      case PhysicalCountStatus.DRAFT:
        return { icon: Clock, color: 'text-admin-text-secondary', bg: 'bg-admin-border', label: 'Borrador' }
      case PhysicalCountStatus.IN_PROGRESS:
        return { icon: Play, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'En Progreso' }
      case PhysicalCountStatus.COMPLETED:
        return { icon: CheckCircle, color: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Completado' }
      case PhysicalCountStatus.REVIEWED:
        return { icon: Eye, color: 'text-admin-primary', bg: 'bg-admin-primary/10', label: 'Revisado' }
      case PhysicalCountStatus.APPROVED:
        return { icon: CheckCircle, color: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Aprobado' }
      case PhysicalCountStatus.CANCELLED:
        return { icon: XCircle, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Cancelado' }
      default:
        return { icon: Clock, color: 'text-admin-text-secondary', bg: 'bg-admin-border', label: 'Desconocido' }
    }
  }

  // Filter counts
  const filteredCounts = counts?.filter(count => {
    const matchesSearch = count.countNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         count.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !selectedStatus || count.status === selectedStatus
    const matchesDateFrom = !selectedDateFrom || new Date(count.countDate) >= new Date(selectedDateFrom)
    const matchesDateTo = !selectedDateTo || new Date(count.countDate) <= new Date(selectedDateTo)
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo
  }) || []

  // Wizard step components
  const renderWizardStep = () => {
    switch (wizardStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paso 1: Información del Conteo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha del Conteo
                </label>
                <input
                  type="date"
                  value={wizardData?.countDate ? new Date(wizardData.countDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setWizardData(prev => prev ? { ...prev, countDate: new Date(e.target.value) } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={wizardData?.notes || ''}
                  onChange={(e) => setWizardData(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="Notas sobre el conteo..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
                />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paso 2: Seleccionar Ingredientes</h3>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-admin-border rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-admin-text-secondary" />
              </div>
              <p className="text-gray-600 mb-4">
                Selecciona los ingredientes que deseas incluir en el conteo
              </p>
              <p className="text-sm text-gray-500">
                (Aquí iría un componente de selección de ingredientes)
              </p>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Paso 3: Confirmar y Crear</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Resumen del Conteo</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">{wizardData?.countDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tienda:</span>
                  <span className="font-medium">{currentStore?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingredientes:</span>
                  <span className="font-medium">{wizardData?.items.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Notas:</span>
                  <span className="font-medium">{wizardData?.notes || 'Sin notas'}</span>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
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
            Conteos Físicos
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Gestiona conteos de inventario y varianzas
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startWizard}
            className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Conteo</span>
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
          <input
            type="text"
            placeholder="Buscar conteos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as PhysicalCountStatus | '')}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todos los estados</option>
          <option value={PhysicalCountStatus.DRAFT}>Borrador</option>
          <option value={PhysicalCountStatus.IN_PROGRESS}>En Progreso</option>
          <option value={PhysicalCountStatus.COMPLETED}>Completado</option>
          <option value={PhysicalCountStatus.REVIEWED}>Revisado</option>
          <option value={PhysicalCountStatus.APPROVED}>Aprobado</option>
          <option value={PhysicalCountStatus.CANCELLED}>Cancelado</option>
        </select>

        <input
          type="date"
          value={selectedDateFrom}
          onChange={(e) => setSelectedDateFrom(e.target.value)}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          placeholder="Fecha desde"
        />

        <input
          type="date"
          value={selectedDateTo}
          onChange={(e) => setSelectedDateTo(e.target.value)}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          placeholder="Fecha hasta"
        />
      </div>

      {/* Counts Table */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredCounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-4 font-medium text-admin-text">Número</th>
                  <th className="text-left p-4 font-medium text-admin-text">Fecha</th>
                  <th className="text-left p-4 font-medium text-admin-text">Estado</th>
                  <th className="text-left p-4 font-medium text-admin-text">Progreso</th>
                  <th className="text-left p-4 font-medium text-admin-text">Varianza</th>
                  <th className="text-left p-4 font-medium text-admin-text">Items</th>
                  <th className="text-left p-4 font-medium text-admin-text">Responsable</th>
                  <th className="text-left p-4 font-medium text-admin-text">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCounts.map((count, index) => {
                  const statusInfo = getStatusInfo(count.status)
                  const progressPercentage = count.totalItems > 0 ? (count.countedItems / count.totalItems) * 100 : 0
                  
                  return (
                    <motion.tr
                      key={count.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-admin-border/50 hover:bg-admin-border/30 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-admin-text-secondary">{count.countNumber}</span>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text">
                          {new Date(count.countDate).toLocaleDateString()}
                        </div>
                        {count.startedAt && (
                          <div className="text-xs text-admin-text-secondary">
                            Inicio: {new Date(count.startedAt).toLocaleTimeString()}
                          </div>
                        )}
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
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-admin-text">
                              {count.countedItems}/{count.totalItems}
                            </span>
                            <span className="text-xs text-admin-text-secondary">
                              {progressPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="h-2 rounded-full bg-admin-primary"
                            />
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-lg font-bold text-admin-text">
                          ${count.varianceAmount.toFixed(2)}
                        </div>
                        <div className="text-xs text-admin-text-secondary">
                          {count.variancePercentage.toFixed(1)}%
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text">
                          {count.items.length} items
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text">
                          {count.countedBy || 'No asignado'}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedCount(count)}
                            className="p-2 hover:bg-admin-border rounded transition-colors"
                          >
                            <Eye className="w-4 h-4 text-admin-text" />
                          </motion.button>
                          
                          {count.status === PhysicalCountStatus.DRAFT && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteCount(count.id)}
                              className="p-2 hover:bg-admin-danger/10 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-admin-danger" />
                            </motion.button>
                          )}
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
              <Search className="w-8 h-8 text-admin-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
              {searchTerm ? 'No se encontraron conteos' : 'No hay conteos'}
            </h3>
            <p className="text-admin-text-secondary mb-4">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'Crea tu primer conteo físico para empezar'
              }
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startWizard}
                className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Conteo</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsWizardOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Wizard Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nuevo Conteo Físico</h2>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${wizardStep >= step 
                        ? 'bg-admin-primary text-white' 
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`
                        w-16 h-1 mx-2
                        ${wizardStep > step ? 'bg-admin-primary' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                ))}
              </div>

              {/* Wizard Content */}
              {renderWizardStep()}

              {/* Wizard Actions */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={prevWizardStep}
                  disabled={wizardStep === 1}
                  className={`
                    px-4 py-2 rounded-lg transition-colors
                    ${wizardStep === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  Anterior
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsWizardOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  {wizardStep < 3 ? (
                    <button
                      onClick={nextWizardStep}
                      className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      onClick={finishWizard}
                      className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover"
                    >
                      Crear Conteo
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
