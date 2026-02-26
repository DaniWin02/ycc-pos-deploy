import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Eye,
  Download
} from 'lucide-react'
import { 
  WasteRecord, 
  WasteRecordCreateRequest,
  WasteRecordUpdateRequest,
  WasteRecordFilters,
  WasteReason,
  WasteStatus
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions
const fetchWasteRecords = async (filters?: WasteRecordFilters): Promise<WasteRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'waste-1',
      recordNumber: 'WASTE-2024-001',
      storeId: 'store-1',
      wasteDate: new Date('2024-01-20'),
      reason: WasteReason.EXPIRED,
      description: 'Productos vencidos en refrigeración',
      totalValue: 125.50,
      recordedBy: 'user-1',
      approvedBy: 'user-2',
      status: WasteStatus.APPROVED,
      items: [
        {
          id: 'waste-item-1',
          wasteRecordId: 'waste-1',
          ingredientId: 'ing-1',
          quantity: 2.5,
          unit: 'kg',
          unitCost: 120.00,
          totalValue: 300.00,
          notes: 'Carne vencida por fecha de caducidad'
        },
        {
          id: 'waste-item-2',
          wasteRecordId: 'waste-1',
          ingredientId: 'ing-3',
          quantity: 1.2,
          unit: 'kg',
          unitCost: 180.00,
          totalValue: 216.00,
          notes: 'Queso con moho detectado'
        }
      ]
    },
    {
      id: 'waste-2',
      recordNumber: 'WASTE-2024-002',
      storeId: 'store-1',
      wasteDate: new Date('2024-01-18'),
      reason: WasteReason.DAMAGED,
      description: 'Productos dañados durante manipulación',
      totalValue: 85.00,
      recordedBy: 'user-1',
      approvedBy: undefined,
      status: WasteStatus.PENDING_APPROVAL,
      items: [
        {
          id: 'waste-item-3',
          wasteRecordId: 'waste-2',
          ingredientId: 'ing-2',
          quantity: 10,
          unit: 'pieza',
          unitCost: 8.00,
          totalValue: 80.00,
          notes: 'Pan aplastado durante transporte'
        },
        {
          id: 'waste-item-4',
          wasteRecordId: 'waste-2',
          ingredientId: 'ing-4',
          quantity: 1,
          unit: 'pieza',
          unitCost: 5.00,
          totalValue: 5.00,
          notes: 'Lechuga golpeada y deteriorada'
        }
      ]
    },
    {
      id: 'waste-3',
      recordNumber: 'WASTE-2024-003',
      storeId: 'store-1',
      wasteDate: new Date('2024-01-15'),
      reason: WasteReason.PREPARATION_ERROR,
      description: 'Errores en preparación de platillos',
      totalValue: 45.00,
      recordedBy: 'user-3',
      approvedBy: 'user-2',
      status: WasteStatus.APPROVED,
      items: [
        {
          id: 'waste-item-5',
          wasteRecordId: 'waste-3',
          ingredientId: 'ing-5',
          quantity: 1.8,
          unit: 'kg',
          unitCost: 25.00,
          totalValue: 45.00,
          notes: 'Tomates cortados incorrectamente'
        }
      ]
    },
    {
      id: 'waste-4',
      recordNumber: 'WASTE-2024-004',
      storeId: 'store-1',
      wasteDate: new Date('2024-01-12'),
      reason: WasteReason.OVERPORTION,
      description: 'Porciones excesivas servidas',
      totalValue: 32.00,
      recordedBy: 'user-1',
      approvedBy: 'user-2',
      status: WasteStatus.APPROVED,
      items: [
        {
          id: 'waste-item-6',
          wasteRecordId: 'waste-4',
          ingredientId: 'ing-2',
          quantity: 4,
          unit: 'pieza',
          unitCost: 8.00,
          totalValue: 32.00,
          notes: 'Pan extra no consumido'
        }
      ]
    },
    {
      id: 'waste-5',
      recordNumber: 'WASTE-2024-005',
      storeId: 'store-1',
      wasteDate: new Date('2024-01-10'),
      reason: WasteReason.CUSTOMER_RETURN,
      description: 'Devolución de cliente por calidad',
      totalValue: 60.00,
      recordedBy: 'user-1',
      approvedBy: undefined,
      status: WasteStatus.PENDING_APPROVAL,
      items: [
        {
          id: 'waste-item-7',
          wasteRecordId: 'waste-5',
          ingredientId: 'ing-1',
          quantity: 0.5,
          unit: 'kg',
          unitCost: 120.00,
          totalValue: 60.00,
          notes: 'Cliente devolvió por mala calidad'
        }
      ]
    }
  ]
}

const createWasteRecord = async (data: WasteRecordCreateRequest): Promise<WasteRecord> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `waste-${Date.now()}`,
    recordNumber: `WASTE-2024-${Date.now()}`,
    ...data,
    status: WasteStatus.PENDING_APPROVAL,
    items: data.items.map(item => ({
      ...item,
      id: `waste-item-${Date.now()}-${Math.random()}`,
      totalValue: item.quantity * item.unitCost
    }))
  }
}

const updateWasteRecord = async (id: string, data: WasteRecordUpdateRequest): Promise<WasteRecord> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id,
    recordNumber: 'WASTE-2024-001',
    storeId: 'store-1',
    wasteDate: new Date(),
    reason: WasteReason.EXPIRED,
    description: 'Updated waste record',
    totalValue: 0,
    recordedBy: 'user-1',
    approvedBy: undefined,
    status: WasteStatus.PENDING_APPROVAL,
    items: []
  }
}

const deleteWasteRecord = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
}

export function InventoryWastePage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReason, setSelectedReason] = useState<WasteReason | ''>('')
  const [selectedStatus, setSelectedStatus] = useState<WasteStatus | ''>('')
  const [selectedDateFrom, setSelectedDateFrom] = useState('')
  const [selectedDateTo, setSelectedDateTo] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingWaste, setEditingWaste] = useState<WasteRecord | null>(null)

  // Queries
  const { data: wasteRecords, isLoading } = useQuery({
    queryKey: ['waste-records', currentStore, searchTerm, selectedReason, selectedStatus, selectedDateFrom, selectedDateTo],
    queryFn: () => fetchWasteRecords({
      storeId: currentStore?.id,
      reason: selectedReason || undefined,
      status: selectedStatus || undefined,
      dateFrom: selectedDateFrom ? new Date(selectedDateFrom) : undefined,
      dateTo: selectedDateTo ? new Date(selectedDateTo) : undefined
    }),
    refetchInterval: 30000
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createWasteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-records'] })
      setIsCreateModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WasteRecordUpdateRequest }) =>
      updateWasteRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-records'] })
      setEditingWaste(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteWasteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-records'] })
    }
  })

  // Handlers
  const handleCreateWasteRecord = (data: WasteRecordCreateRequest) => {
    createMutation.mutate(data)
  }

  const handleUpdateWasteRecord = (data: WasteRecordUpdateRequest) => {
    if (editingWaste) {
      updateMutation.mutate({ id: editingWaste.id, data })
    }
  }

  const handleDeleteWasteRecord = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro de desperdicio?')) {
      deleteMutation.mutate(id)
    }
  }

  // Get reason info
  const getReasonInfo = (reason: WasteReason) => {
    switch (reason) {
      case WasteReason.EXPIRED:
        return { icon: Calendar, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Vencido' }
      case WasteReason.DAMAGED:
        return { icon: AlertTriangle, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Dañado' }
      case WasteReason.PREPARATION_ERROR:
        return { icon: AlertTriangle, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Error en Preparación' }
      case WasteReason.OVERPORTION:
        return { icon: AlertTriangle, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Porción Excesiva' }
      case WasteReason.CUSTOMER_RETURN:
        return { icon: AlertTriangle, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Devolución Cliente' }
      case WasteReason.THEFT:
        return { icon: XCircle, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Robo' }
      case WasteReason.QUALITY_ISSUE:
        return { icon: AlertTriangle, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Problema de Calidad' }
      default:
        return { icon: AlertTriangle, color: 'text-admin-text', bg: 'bg-admin-border', label: 'Desconocido' }
    }
  }

  // Get status info
  const getStatusInfo = (status: WasteStatus) => {
    switch (status) {
      case WasteStatus.PENDING_APPROVAL:
        return { icon: Clock, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Pendiente Aprobación' }
      case WasteStatus.APPROVED:
        return { icon: CheckCircle, color: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Aprobado' }
      case WasteStatus.CANCELLED:
        return { icon: XCircle, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Cancelado' }
      default:
        return { icon: Clock, color: 'text-admin-text-secondary', bg: 'bg-admin-border', label: 'Desconocido' }
    }
  }

  // Filter waste records
  const filteredWasteRecords = wasteRecords?.filter(record => {
    const matchesSearch = record.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesReason = !selectedReason || record.reason === selectedReason
    const matchesStatus = !selectedStatus || record.status === selectedStatus
    const matchesDateFrom = !selectedDateFrom || new Date(record.wasteDate) >= new Date(selectedDateFrom)
    const matchesDateTo = !selectedDateTo || new Date(record.wasteDate) <= new Date(selectedDateTo)
    return matchesSearch && matchesReason && matchesStatus && matchesDateFrom && matchesDateTo
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
            Registro de Desperdicios
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Gestiona pérdidas de inventario y análisis de desperdicios
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
            <span>Nuevo Registro</span>
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
          <input
            type="text"
            placeholder="Buscar registros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

        <select
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value as WasteReason | '')}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todas las razones</option>
          <option value={WasteReason.EXPIRED}>Vencido</option>
          <option value={WasteReason.DAMAGED}>Dañado</option>
          <option value={WasteReason.PREPARATION_ERROR}>Error en Preparación</option>
          <option value={WasteReason.OVERPORTION}>Porción Excesiva</option>
          <option value={WasteReason.CUSTOMER_RETURN}>Devolución Cliente</option>
          <option value={WasteReason.THEFT}>Robo</option>
          <option value={WasteReason.QUALITY_ISSUE}>Problema de Calidad</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as WasteStatus | '')}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todos los estados</option>
          <option value={WasteStatus.PENDING_APPROVAL}>Pendiente Aprobación</option>
          <option value={WasteStatus.APPROVED}>Aprobado</option>
          <option value={WasteStatus.CANCELLED}>Cancelado</option>
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

      {/* Waste Records Table */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredWasteRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-4 font-medium text-admin-text">Número</th>
                  <th className="text-left p-4 font-medium text-admin-text">Fecha</th>
                  <th className="text-left p-4 font-medium text-admin-text">Razón</th>
                  <th className="text-left p-4 font-medium text-admin-text">Descripción</th>
                  <th className="text-left p-4 font-medium text-admin-text">Valor</th>
                  <th className="text-left p-4 font-medium text-admin-text">Items</th>
                  <th className="text-left p-4 font-medium text-admin-text">Estado</th>
                  <th className="text-left p-4 font-medium text-admin-text">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredWasteRecords.map((record, index) => {
                  const reasonInfo = getReasonInfo(record.reason)
                  const statusInfo = getStatusInfo(record.status)
                  
                  return (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-admin-border/50 hover:bg-admin-border/30 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-admin-text-secondary">{record.recordNumber}</span>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text">
                          {new Date(record.wasteDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-admin-text-secondary">
                          {new Date(record.wasteDate).toLocaleTimeString()}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${reasonInfo.bg} ${reasonInfo.color}
                        `}>
                          {React.createElement(reasonInfo.icon, { className: 'w-3 h-3 inline mr-1' })}
                          {reasonInfo.label}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text">
                          {record.description}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-lg font-bold text-admin-text">
                          ${record.totalValue.toFixed(2)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text">
                          {record.items.length} items
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
                            onClick={() => setEditingWaste(record)}
                            className="p-2 hover:bg-admin-border rounded transition-colors"
                          >
                            <Eye className="w-4 h-4 text-admin-text" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteWasteRecord(record.id)}
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
              <AlertTriangle className="w-8 h-8 text-admin-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
              {searchTerm ? 'No se encontraron registros' : 'No hay registros de desperdicios'}
            </h3>
            <p className="text-admin-text-secondary mb-4">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'Crea tu primer registro de desperdicio para empezar'
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
                <span>Crear Registro</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            ${wasteRecords?.reduce((sum, record) => sum + record.totalValue, 0).toFixed(2)}
          </h3>
          <p className="text-sm text-admin-text-secondary">Valor Total Perdido</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            {wasteRecords?.length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Total Registros</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-warning">
            {wasteRecords?.filter(r => r.status === WasteStatus.PENDING_APPROVAL).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Pendientes Aprobación</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-danger">
            {wasteRecords?.filter(r => r.reason === WasteReason.EXPIRED).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Productos Vencidos</p>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nuevo Registro de Desperdicio</h2>
              <p className="text-gray-600 mb-4">
                Formulario de creación de registro (placeholder - implementar formulario completo)
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
                    handleCreateWasteRecord({
                      storeId: currentStore?.id || '',
                      wasteDate: new Date(),
                      reason: WasteReason.EXPIRED,
                      description: 'Productos vencidos',
                      recordedBy: 'user-1',
                      items: [
                        {
                          ingredientId: 'ing-1',
                          quantity: 1,
                          unit: 'kg',
                          unitCost: 120.00,
                          notes: ''
                        }
                      ]
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
