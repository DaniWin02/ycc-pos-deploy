import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Eye,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  User,
  Building2
} from 'lucide-react'
import { 
  InventoryMovement, 
  InventoryMovementType,
  InventoryMovementFilters
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Helper function to generate dynamic dates
const getDynamicDate = (daysAgo: number = 0, hoursAgo: number = 0, minutesAgo: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date;
};

const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Mock API functions
const fetchInventoryMovements = async (filters?: InventoryMovementFilters): Promise<InventoryMovement[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'movement-1',
      movementNumber: 'MOV-2024-001',
      storeId: 'store-1',
      movementType: InventoryMovementType.PURCHASE_RECEIPT,
      movementDate: new Date(`${formatDateToISO(getDynamicDate(10))}T10:30:00`),
      referenceId: 'po-1',
      referenceNumber: 'PO-2024-001',
      description: 'Recepción de orden de compra - Carnicería Central',
      totalValue: 2900.00,
      moverId: 'user-3',
      mover: 'user-3',
      items: [
        {
          id: 'movement-item-1',
          inventoryMovementId: 'movement-1',
          ingredientId: 'ing-1',
          ingredient: 'ing-1',
          quantityBefore: 15.5,
          quantityAfter: 35.5,
          quantityChange: 20.0,
          unit: 'kg',
          unitCost: 120.00,
          totalValue: 2400.00,
          notes: 'Carne premium recibida'
        },
        {
          id: 'movement-item-2',
          inventoryMovementId: 'movement-1',
          ingredientId: 'ing-3',
          ingredient: 'ing-3',
          quantityBefore: 8.2,
          quantityAfter: 18.2,
          quantityChange: 10.0,
          unit: 'kg',
          unitCost: 180.00,
          totalValue: 1800.00,
          notes: 'Queso cheddar recibido'
        }
      ]
    },
    {
      id: 'movement-2',
      movementNumber: 'MOV-2024-002',
      storeId: 'store-1',
      movementType: InventoryMovementType.WASTE,
      movementDate: new Date(`${formatDateToISO(getDynamicDate(10))}T14:15:00`),
      referenceId: 'waste-1',
      referenceNumber: 'WASTE-2024-001',
      description: 'Registro de desperdicio - Productos vencidos',
      totalValue: 516.00,
      moverId: 'user-1',
      mover: 'user-1',
      items: [
        {
          id: 'movement-item-3',
          inventoryMovementId: 'movement-2',
          ingredientId: 'ing-1',
          ingredient: 'ing-1',
          quantityBefore: 35.5,
          quantityAfter: 33.0,
          quantityChange: -2.5,
          unit: 'kg',
          unitCost: 120.00,
          totalValue: 300.00,
          notes: 'Carne vencida'
        },
        {
          id: 'movement-item-4',
          inventoryMovementId: 'movement-2',
          ingredientId: 'ing-3',
          ingredient: 'ing-3',
          quantityBefore: 18.2,
          quantityAfter: 17.0,
          quantityChange: -1.2,
          unit: 'kg',
          unitCost: 180.00,
          totalValue: 216.00,
          notes: 'Queso con moho'
        }
      ]
    },
    {
      id: 'movement-3',
      movementNumber: 'MOV-2024-003',
      storeId: 'store-1',
      movementType: InventoryMovementType.PHYSICAL_COUNT,
      movementDate: new Date(`${formatDateToISO(getDynamicDate(12))}T09:00:00`),
      referenceId: 'count-1',
      referenceNumber: 'COUNT-2024-001',
      description: 'Ajuste por conteo físico - Conteo mensual',
      totalValue: 44.00,
      moverId: 'user-1',
      mover: 'user-1',
      items: [
        {
          id: 'movement-item-5',
          inventoryMovementId: 'movement-3',
          ingredientId: 'ing-2',
          ingredient: 'ing-2',
          quantityBefore: 45,
          quantityAfter: 43,
          quantityChange: -2,
          unit: 'pieza',
          unitCost: 8.00,
          totalValue: -16.00,
          notes: 'Ajuste por conteo'
        },
        {
          id: 'movement-item-6',
          inventoryMovementId: 'movement-3',
          ingredientId: 'ing-4',
          ingredient: 'ing-4',
          quantityBefore: 12,
          quantityAfter: 13,
          quantityChange: 1,
          unit: 'pieza',
          unitCost: 5.00,
          totalValue: 5.00,
          notes: 'Ajuste positivo'
        }
      ]
    },
    {
      id: 'movement-4',
      movementNumber: 'MOV-2024-004',
      storeId: 'store-1',
      movementType: InventoryMovementType.SALE_USAGE,
      movementDate: new Date(`${formatDateToISO(getDynamicDate(10))}T12:30:00`),
      referenceId: 'sale-123',
      referenceNumber: 'SALE-2024-001',
      description: 'Uso en venta - Pedido #123',
      totalValue: 45.00,
      moverId: 'system',
      mover: 'system',
      items: [
        {
          id: 'movement-item-7',
          inventoryMovementId: 'movement-4',
          ingredientId: 'ing-1',
          ingredient: 'ing-1',
          quantityBefore: 33.0,
          quantityAfter: 32.2,
          quantityChange: -0.8,
          unit: 'kg',
          unitCost: 120.00,
          totalValue: 96.00,
          notes: 'Hamburguesa clásica'
        },
        {
          id: 'movement-item-8',
          inventoryMovementId: 'movement-4',
          ingredientId: 'ing-2',
          ingredient: 'ing-2',
          quantityBefore: 43,
          quantityAfter: 42,
          quantityChange: -1,
          unit: 'pieza',
          unitCost: 8.00,
          totalValue: 8.00,
          notes: 'Pan brioche'
        }
      ]
    },
    {
      id: 'movement-5',
      movementNumber: 'MOV-2024-005',
      storeId: 'store-1',
      movementType: InventoryMovementType.TRANSFER,
      movementDate: new Date(`${formatDateToISO(getDynamicDate(11))}T16:45:00`),
      referenceId: 'transfer-1',
      referenceNumber: 'TRANS-2024-001',
      description: 'Transferencia entre tiendas - Envío a sucursal 2',
      totalValue: 150.00,
      moverId: 'user-2',
      mover: 'user-2',
      items: [
        {
          id: 'movement-item-9',
          inventoryMovementId: 'movement-5',
          ingredientId: 'ing-5',
          ingredient: 'ing-5',
          quantityBefore: 25.5,
          quantityAfter: 22.5,
          quantityChange: -3.0,
          unit: 'kg',
          unitCost: 25.00,
          totalValue: 75.00,
          notes: 'Tomates transferidos'
        },
        {
          id: 'movement-item-10',
          inventoryMovementId: 'movement-5',
          ingredientId: 'ing-4',
          ingredient: 'ing-4',
          quantityBefore: 13,
          quantityAfter: 10,
          quantityChange: -3,
          unit: 'pieza',
          unitCost: 5.00,
          totalValue: 15.00,
          notes: 'Lechuga transferida'
        }
      ]
    },
    {
      id: 'movement-6',
      movementNumber: 'MOV-2024-006',
      storeId: 'store-1',
      movementType: InventoryMovementType.ADJUSTMENT,
      movementDate: new Date(`${formatDateToISO(getDynamicDate(13))}T11:20:00`),
      referenceId: 'adj-1',
      referenceNumber: 'ADJ-2024-001',
      description: 'Ajuste manual - Corrección de inventario',
      totalValue: 25.00,
      moverId: 'user-1',
      mover: 'user-1',
      items: [
        {
          id: 'movement-item-11',
          inventoryMovementId: 'movement-6',
          ingredientId: 'ing-2',
          ingredient: 'ing-2',
          quantityBefore: 44,
          quantityAfter: 45,
          quantityChange: 1,
          unit: 'pieza',
          unitCost: 8.00,
          totalValue: 8.00,
          notes: 'Ajuste por error de conteo'
        }
      ]
    },
    {
      id: 'movement-7',
      movementNumber: 'MOV-2024-007',
      storeId: 'store-1',
      movementType: InventoryMovementType.RETURN,
      movementDate: new Date(`${formatDateToISO(getDynamicDate(14))}T15:30:00`),
      referenceId: 'return-1',
      referenceNumber: 'RETURN-2024-001',
      description: 'Devolución a proveedor - Calidad insuficiente',
      totalValue: -120.00,
      moverId: 'user-2',
      mover: 'user-2',
      items: [
        {
          id: 'movement-item-12',
          inventoryMovementId: 'movement-7',
          ingredientId: 'ing-1',
          ingredient: 'ing-1',
          quantityBefore: 45.0,
          quantityAfter: 44.0,
          quantityChange: -1.0,
          unit: 'kg',
          unitCost: 120.00,
          totalValue: -120.00,
          notes: 'Carne devuelta por calidad'
        }
      ]
    }
  ]
}

export function InventoryMovementsPage() {
  const { currentStore } = useAdminStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<InventoryMovementType | ''>('')
  const [selectedDateFrom, setSelectedDateFrom] = useState('')
  const [selectedDateTo, setSelectedDateTo] = useState('')
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null)

  // Queries
  const { data: movements, isLoading } = useQuery({
    queryKey: ['inventory-movements', currentStore, searchTerm, selectedType, selectedDateFrom, selectedDateTo],
    queryFn: () => fetchInventoryMovements({
      storeId: currentStore?.id,
      movementType: selectedType || undefined,
      dateFrom: selectedDateFrom ? new Date(selectedDateFrom) : undefined,
      dateTo: selectedDateTo ? new Date(selectedDateTo) : undefined
    }),
    refetchInterval: 30000
  })

  // Get movement type info
  const getMovementTypeInfo = (type: InventoryMovementType) => {
    switch (type) {
      case InventoryMovementType.PURCHASE_RECEIPT:
        return { icon: Truck, color: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Recepción Compra' }
      case InventoryMovementType.SALE_USAGE:
        return { icon: ShoppingCart, color: 'text-admin-primary', bg: 'bg-admin-primary/10', label: 'Uso en Venta' }
      case InventoryMovementType.WASTE:
        return { icon: AlertTriangle, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Desperdicio' }
      case InventoryMovementType.PHYSICAL_COUNT:
        return { icon: Package, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Conteo Físico' }
      case InventoryMovementType.TRANSFER:
        return { icon: Building2, color: 'text-admin-primary', bg: 'bg-admin-primary/10', label: 'Transferencia' }
      case InventoryMovementType.ADJUSTMENT:
        return { icon: TrendingUp, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Ajuste' }
      case InventoryMovementType.RETURN:
        return { icon: TrendingDown, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Devolución' }
      default:
        return { icon: Package, color: 'text-admin-text-secondary', bg: 'bg-admin-border', label: 'Desconocido' }
    }
  }

  // Filter movements
  const filteredMovements = movements?.filter(movement => {
    const matchesSearch = movement.movementNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || movement.movementType === selectedType
    const matchesDateFrom = !selectedDateFrom || new Date(movement.movementDate) >= new Date(selectedDateFrom)
    const matchesDateTo = !selectedDateTo || new Date(movement.movementDate) <= new Date(selectedDateTo)
    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo
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
            Timeline de Movimientos
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Historial completo de movimientos de inventario
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
          <input
            type="text"
            placeholder="Buscar movimientos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as InventoryMovementType | '')}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todos los tipos</option>
          <option value={InventoryMovementType.PURCHASE_RECEIPT}>Recepción Compra</option>
          <option value={InventoryMovementType.SALE_USAGE}>Uso en Venta</option>
          <option value={InventoryMovementType.WASTE}>Desperdicio</option>
          <option value={InventoryMovementType.PHYSICAL_COUNT}>Conteo Físico</option>
          <option value={InventoryMovementType.TRANSFER}>Transferencia</option>
          <option value={InventoryMovementType.ADJUSTMENT}>Ajuste</option>
          <option value={InventoryMovementType.RETURN}>Devolución</option>
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

      {/* Timeline */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredMovements.length > 0 ? (
          <div className="p-6">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-admin-border"></div>
              
              {/* Timeline Items */}
              <div className="space-y-6">
                {filteredMovements.map((movement, index) => {
                  const typeInfo = getMovementTypeInfo(movement.movementType)
                  
                  return (
                    <motion.div
                      key={movement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start space-x-4"
                    >
                      {/* Timeline Dot */}
                      <div className={`
                        relative z-10 w-16 h-16 rounded-full flex items-center justify-center
                        ${typeInfo.bg}
                      `}>
                        {React.createElement(typeInfo.icon, { 
                          className: `w-8 h-8 ${typeInfo.color}` 
                        })}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-white border border-admin-border rounded-lg p-4 hover:shadow-md transition-shadow">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-admin-text">
                                {movement.movementNumber}
                              </h3>
                              <div className={`
                                px-2 py-1 rounded-full text-xs font-medium
                                ${typeInfo.bg} ${typeInfo.color}
                              `}>
                                {typeInfo.label}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-admin-text-secondary">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(movement.movementDate).toLocaleDateString()}</span>
                              <Clock className="w-4 h-4" />
                              <span>{new Date(movement.movementDate).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          
                          {/* Description */}
                          <p className="text-admin-text mb-3">{movement.description}</p>
                          
                          {/* Reference */}
                          {movement.referenceNumber && (
                            <div className="text-sm text-admin-text-secondary mb-3">
                              Referencia: <span className="font-mono">{movement.referenceNumber}</span>
                            </div>
                          )}
                          
                          {/* Items Summary */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-admin-text-secondary">
                              {movement.items.length} items afectados
                            </div>
                            <div className="text-lg font-bold text-admin-text">
                              ${movement.totalValue.toFixed(2)}
                            </div>
                          </div>
                          
                          {/* User */}
                          <div className="flex items-center space-x-2 text-sm text-admin-text-secondary">
                            <User className="w-4 h-4" />
                            <span>{movement.mover === 'system' ? 'Sistema' : 'Usuario'}</span>
                          </div>
                          
                          {/* View Details Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedMovement(movement)}
                            className="mt-3 flex items-center space-x-2 text-admin-primary hover:text-admin-primary-hover text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver detalles</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-admin-border rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-admin-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
              {searchTerm ? 'No se encontraron movimientos' : 'No hay movimientos'}
            </h3>
            <p className="text-admin-text-secondary">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'No hay movimientos de inventario registrados'
              }
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            {movements?.length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Total Movimientos</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-success">
            {movements?.filter(m => m.movementType === InventoryMovementType.PURCHASE_RECEIPT).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Recepciones</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-danger">
            {movements?.filter(m => m.movementType === InventoryMovementType.WASTE).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Desperdicios</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-primary">
            {movements?.filter(m => m.movementType === InventoryMovementType.SALE_USAGE).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Uso en Ventas</p>
        </div>
      </div>

      {/* Movement Details Modal */}
      <AnimatePresence>
        {selectedMovement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMovement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-admin-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedMovement.movementNumber}
                    </h2>
                    <div className={`
                      inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium
                      ${getMovementTypeInfo(selectedMovement.movementType).bg} 
                      ${getMovementTypeInfo(selectedMovement.movementType).color}
                    `}>
                      {getMovementTypeInfo(selectedMovement.movementType).label}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMovement(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha y Hora</h3>
                    <p className="text-gray-900">
                      {new Date(selectedMovement.movementDate).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Valor Total</h3>
                    <p className="text-gray-900 font-bold">
                      ${selectedMovement.totalValue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Referencia</h3>
                    <p className="text-gray-900 font-mono">
                      {selectedMovement.referenceNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Responsable</h3>
                    <p className="text-gray-900">
                      {selectedMovement.mover === 'system' ? 'Sistema' : 'Usuario'}
                    </p>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                  <p className="text-gray-900">{selectedMovement.description}</p>
                </div>
                
                {/* Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Afectados</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-2 text-sm font-medium text-gray-500">Ingrediente</th>
                          <th className="text-left p-2 text-sm font-medium text-gray-500">Antes</th>
                          <th className="text-left p-2 text-sm font-medium text-gray-500">Después</th>
                          <th className="text-left p-2 text-sm font-medium text-gray-500">Cambio</th>
                          <th className="text-left p-2 text-sm font-medium text-gray-500">Valor</th>
                          <th className="text-left p-2 text-sm font-medium text-gray-500">Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMovement.items.map((item, index) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="p-2 text-sm text-gray-900">
                              Ingrediente {item.ingredientId}
                            </td>
                            <td className="p-2 text-sm text-gray-900">
                              {item.quantityBefore} {item.unit}
                            </td>
                            <td className="p-2 text-sm text-gray-900">
                              {item.quantityAfter} {item.unit}
                            </td>
                            <td className="p-2 text-sm">
                              <span className={`font-medium ${
                                item.quantityChange > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.quantityChange > 0 ? '+' : ''}{item.quantityChange} {item.unit}
                              </span>
                            </td>
                            <td className="p-2 text-sm text-gray-900">
                              ${item.totalValue.toFixed(2)}
                            </td>
                            <td className="p-2 text-sm text-gray-500">
                              {item.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
