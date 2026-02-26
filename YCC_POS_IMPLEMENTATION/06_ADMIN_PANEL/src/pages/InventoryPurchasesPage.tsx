import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Truck,
  ShoppingCart
} from 'lucide-react'
import { 
  PurchaseOrder, 
  PurchaseOrderStatus,
  PurchaseOrderCreateRequest,
  PurchaseOrderUpdateRequest,
  PurchaseOrderReceiveRequest,
  PurchaseOrderFilters
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions
const fetchPurchaseOrders = async (filters?: PurchaseOrderFilters): Promise<PurchaseOrder[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'po-1',
      orderNumber: 'PO-2024-001',
      supplierId: 'sup-1',
      storeId: 'store-1',
      status: PurchaseOrderStatus.APPROVED,
      orderDate: new Date('2024-01-15'),
      expectedDeliveryDate: new Date('2024-01-20'),
      actualDeliveryDate: undefined,
      subtotal: 2500.00,
      taxAmount: 400.00,
      totalAmount: 2900.00,
      notes: 'Orden mensual de carnes',
      internalNotes: 'Prioridad alta',
      createdBy: 'user-1',
      approvedBy: 'user-2',
      receivedBy: undefined,
      items: [
        {
          id: 'po-item-1',
          purchaseOrderId: 'po-1',
          ingredientId: 'ing-1',
          quantity: 20,
          unit: 'kg',
          unitPrice: 120.00,
          totalPrice: 2400.00,
          receivedQuantity: 0,
          remainingQuantity: 20,
          notes: 'Carne premium'
        },
        {
          id: 'po-item-2',
          purchaseOrderId: 'po-1',
          ingredientId: 'ing-3',
          quantity: 10,
          unit: 'kg',
          unitPrice: 180.00,
          totalPrice: 1800.00,
          receivedQuantity: 0,
          remainingQuantity: 10,
          notes: 'Queso cheddar'
        }
      ]
    },
    {
      id: 'po-2',
      orderNumber: 'PO-2024-002',
      supplierId: 'sup-2',
      storeId: 'store-1',
      status: PurchaseOrderStatus.SENT,
      orderDate: new Date('2024-01-18'),
      expectedDeliveryDate: new Date('2024-01-22'),
      actualDeliveryDate: undefined,
      subtotal: 1600.00,
      taxAmount: 256.00,
      totalAmount: 1856.00,
      notes: 'Orden de panadería',
      internalNotes: 'Revisión pendiente',
      createdBy: 'user-1',
      approvedBy: undefined,
      receivedBy: undefined,
      items: [
        {
          id: 'po-item-3',
          purchaseOrderId: 'po-2',
          ingredientId: 'ing-2',
          quantity: 200,
          unit: 'pieza',
          unitPrice: 8.00,
          totalPrice: 1600.00,
          receivedQuantity: 0,
          remainingQuantity: 200,
          notes: 'Pan brioche'
        }
      ]
    },
    {
      id: 'po-3',
      orderNumber: 'PO-2024-003',
      supplierId: 'sup-3',
      storeId: 'store-1',
      status: PurchaseOrderStatus.RECEIVED,
      orderDate: new Date('2024-01-10'),
      expectedDeliveryDate: new Date('2024-01-15'),
      actualDeliveryDate: new Date('2024-01-14'),
      subtotal: 800.00,
      taxAmount: 128.00,
      totalAmount: 928.00,
      notes: 'Orden de verduras',
      internalNotes: 'Recibido parcialmente',
      createdBy: 'user-1',
      approvedBy: 'user-2',
      receivedBy: 'user-3',
      items: [
        {
          id: 'po-item-4',
          purchaseOrderId: 'po-3',
          ingredientId: 'ing-4',
          quantity: 100,
          unit: 'pieza',
          unitPrice: 5.00,
          totalPrice: 500.00,
          receivedQuantity: 80,
          remainingQuantity: 20,
          notes: 'Lechuga fresca'
        },
        {
          id: 'po-item-5',
          purchaseOrderId: 'po-3',
          ingredientId: 'ing-5',
          quantity: 12,
          unit: 'kg',
          unitPrice: 25.00,
          totalPrice: 300.00,
          receivedQuantity: 12,
          remainingQuantity: 0,
          notes: 'Tomate fresco'
        }
      ]
    }
  ]
}

const createPurchaseOrder = async (data: PurchaseOrderCreateRequest): Promise<PurchaseOrder> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `po-${Date.now()}`,
    orderNumber: `PO-2024-${Date.now()}`,
    ...data,
    status: PurchaseOrderStatus.DRAFT,
    subtotal: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
    taxAmount: 0,
    totalAmount: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
    orderDate: new Date(),
    actualDeliveryDate: undefined,
    createdBy: 'user-1',
    approvedBy: undefined,
    receivedBy: undefined,
    items: data.items.map(item => ({
      ...item,
      id: `po-item-${Date.now()}-${Math.random()}`,
      totalPrice: item.quantity * item.unitPrice,
      receivedQuantity: 0,
      remainingQuantity: item.quantity
    }))
  }
}

const updatePurchaseOrder = async (id: string, data: PurchaseOrderUpdateRequest): Promise<PurchaseOrder> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id,
    orderNumber: 'PO-2024-001',
    supplierId: 'sup-1',
    storeId: 'store-1',
    status: PurchaseOrderStatus.APPROVED,
    orderDate: new Date(),
    expectedDeliveryDate: new Date(),
    actualDeliveryDate: undefined,
    subtotal: 2500.00,
    taxAmount: 400.00,
    totalAmount: 2900.00,
    notes: 'Updated order',
    createdBy: 'user-1',
    approvedBy: 'user-2',
    receivedBy: undefined,
    items: []
  }
}

const deletePurchaseOrder = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
}

const receivePurchaseOrder = async (id: string, data: PurchaseOrderReceiveRequest): Promise<PurchaseOrder> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    id,
    orderNumber: 'PO-2024-001',
    supplierId: 'sup-1',
    storeId: 'store-1',
    status: PurchaseOrderStatus.RECEIVED,
    orderDate: new Date(),
    expectedDeliveryDate: new Date(),
    actualDeliveryDate: data.receivedDate,
    subtotal: 2500.00,
    taxAmount: 400.00,
    totalAmount: 2900.00,
    notes: 'Order received',
    createdBy: 'user-1',
    approvedBy: 'user-2',
    receivedBy: data.receivedBy,
    items: []
  }
}

export function InventoryPurchasesPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<PurchaseOrderStatus | ''>('')
  const [selectedDateFrom, setSelectedDateFrom] = useState('')
  const [selectedDateTo, setSelectedDateTo] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)

  // Queries
  const { data: orders, isLoading } = useQuery({
    queryKey: ['purchase-orders', currentStore, searchTerm, selectedSupplier, selectedStatus, selectedDateFrom, selectedDateTo],
    queryFn: () => fetchPurchaseOrders({
      storeId: currentStore?.id,
      supplierId: selectedSupplier || undefined,
      status: selectedStatus || undefined,
      dateFrom: selectedDateFrom ? new Date(selectedDateFrom) : undefined,
      dateTo: selectedDateTo ? new Date(selectedDateTo) : undefined
    }),
    refetchInterval: 30000
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setIsCreateModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseOrderUpdateRequest }) =>
      updatePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setSelectedOrder(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    }
  })

  const receiveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseOrderReceiveRequest }) =>
      receivePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] })
      setIsReceiveModalOpen(false)
      setSelectedOrder(null)
    }
  })

  // Handlers
  const handleCreateOrder = (data: PurchaseOrderCreateRequest) => {
    createMutation.mutate(data)
  }

  const handleUpdateOrder = (data: PurchaseOrderUpdateRequest) => {
    if (selectedOrder) {
      updateMutation.mutate({ id: selectedOrder.id, data })
    }
  }

  const handleDeleteOrder = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta orden de compra?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleReceiveOrder = (data: PurchaseOrderReceiveRequest) => {
    if (selectedOrder) {
      receiveMutation.mutate({ id: selectedOrder.id, data })
    }
  }

  // Get status info
  const getStatusInfo = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        return { icon: Clock, color: 'text-admin-text-secondary', bg: 'bg-admin-border', label: 'Borrador' }
      case PurchaseOrderStatus.PENDING_APPROVAL:
        return { icon: Clock, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Pendiente Aprobación' }
      case PurchaseOrderStatus.APPROVED:
        return { icon: CheckCircle, color: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Aprobado' }
      case PurchaseOrderStatus.SENT:
        return { icon: Truck, color: 'text-admin-primary', bg: 'bg-admin-primary/10', label: 'Enviado' }
      case PurchaseOrderStatus.PARTIAL_RECEIVED:
        return { icon: Package, color: 'text-admin-warning', bg: 'bg-admin-warning/10', label: 'Recibido Parcial' }
      case PurchaseOrderStatus.RECEIVED:
        return { icon: CheckCircle, color: 'text-admin-success', bg: 'bg-admin-success/10', label: 'Recibido' }
      case PurchaseOrderStatus.CANCELLED:
        return { icon: XCircle, color: 'text-admin-danger', bg: 'bg-admin-danger/10', label: 'Cancelado' }
      default:
        return { icon: Clock, color: 'text-admin-text-secondary', bg: 'bg-admin-border', label: 'Desconocido' }
    }
  }

  // Filter orders
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSupplier = !selectedSupplier || order.supplierId === selectedSupplier
    const matchesStatus = !selectedStatus || order.status === selectedStatus
    const matchesDateFrom = !selectedDateFrom || new Date(order.orderDate) >= new Date(selectedDateFrom)
    const matchesDateTo = !selectedDateTo || new Date(order.orderDate) <= new Date(selectedDateTo)
    return matchesSearch && matchesSupplier && matchesStatus && matchesDateFrom && matchesDateTo
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
            Órdenes de Compra
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Gestiona órdenes de compra y recepción de mercancía
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
            <span>Nueva Orden</span>
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
          <input
            type="text"
            placeholder="Buscar órdenes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todos los proveedores</option>
          <option value="sup-1">Carnicería Central</option>
          <option value="sup-2">Panadería</option>
          <option value="sup-3">Verdurería</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as PurchaseOrderStatus | '')}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todos los estados</option>
          <option value={PurchaseOrderStatus.DRAFT}>Borrador</option>
          <option value={PurchaseOrderStatus.PENDING_APPROVAL}>Pendiente Aprobación</option>
          <option value={PurchaseOrderStatus.APPROVED}>Aprobado</option>
          <option value={PurchaseOrderStatus.SENT}>Enviado</option>
          <option value={PurchaseOrderStatus.PARTIAL_RECEIVED}>Recibido Parcial</option>
          <option value={PurchaseOrderStatus.RECEIVED}>Recibido</option>
          <option value={PurchaseOrderStatus.CANCELLED}>Cancelado</option>
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

      {/* Orders Table */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-4 font-medium text-admin-text">Número</th>
                  <th className="text-left p-4 font-medium text-admin-text">Proveedor</th>
                  <th className="text-left p-4 font-medium text-admin-text">Fecha</th>
                  <th className="text-left p-4 font-medium text-admin-text">Entrega</th>
                  <th className="text-left p-4 font-medium text-admin-text">Total</th>
                  <th className="text-left p-4 font-medium text-admin-text">Estado</th>
                  <th className="text-left p-4 font-medium text-admin-text">Items</th>
                  <th className="text-left p-4 font-medium text-admin-text">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const statusInfo = getStatusInfo(order.status)
                  
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-admin-border/50 hover:bg-admin-border/30 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm text-admin-text-secondary">{order.orderNumber}</span>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text">
                          {order.supplierId === 'sup-1' ? 'Carnicería Central' : 
                           order.supplierId === 'sup-2' ? 'Panadería' : 'Verdurería'}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-admin-text-secondary">
                          {new Date(order.orderDate).toLocaleTimeString()}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm text-admin-text">
                          {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                        </div>
                        {order.actualDeliveryDate && (
                          <div className="text-xs text-admin-success">
                            Recibido: {new Date(order.actualDeliveryDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="text-lg font-bold text-admin-text">
                          ${order.totalAmount.toFixed(2)}
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
                        <div className="text-sm text-admin-text">
                          {order.items.length} items
                        </div>
                        <div className="text-xs text-admin-text-secondary">
                          {order.items.filter(item => item.receivedQuantity > 0).length} recibidos
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-admin-border rounded transition-colors"
                          >
                            <Eye className="w-4 h-4 text-admin-text" />
                          </motion.button>
                          
                          {order.status === PurchaseOrderStatus.APPROVED && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setSelectedOrder(order)
                                setIsReceiveModalOpen(true)
                              }}
                              className="p-2 hover:bg-admin-success/10 rounded transition-colors"
                            >
                              <Truck className="w-4 h-4 text-admin-success" />
                            </motion.button>
                          )}
                          
                          {order.status === PurchaseOrderStatus.DRAFT && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteOrder(order.id)}
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
              <ShoppingCart className="w-8 h-8 text-admin-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
              {searchTerm ? 'No se encontraron órdenes' : 'No hay órdenes de compra'}
            </h3>
            <p className="text-admin-text-secondary mb-4">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'Crea tu primera orden de compra para empezar'
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
                <span>Crear Orden</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            {orders?.length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Total Órdenes</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-warning">
            {orders?.filter(o => o.status === PurchaseOrderStatus.PENDING_APPROVAL).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Pendientes Aprobación</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-primary">
            {orders?.filter(o => o.status === PurchaseOrderStatus.SENT).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Enviadas</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-success">
            {orders?.filter(o => o.status === PurchaseOrderStatus.RECEIVED).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Recibidas</p>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Orden de Compra</h2>
              <p className="text-gray-600 mb-4">
                Formulario de creación de orden (placeholder - implementar formulario completo)
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
                    handleCreateOrder({
                      supplierId: 'sup-1',
                      storeId: currentStore?.id || '',
                      expectedDeliveryDate: new Date(),
                      notes: 'Nueva orden',
                      internalNotes: '',
                      items: [
                        {
                          ingredientId: 'ing-1',
                          quantity: 10,
                          unit: 'kg',
                          unitPrice: 120.00,
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

      {/* Receive Modal */}
      <AnimatePresence>
        {isReceiveModalOpen && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsReceiveModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recibir Orden de Compra</h2>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-2">{selectedOrder.orderNumber}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proveedor:</span>
                    <span className="font-medium">
                      {selectedOrder.supplierId === 'sup-1' ? 'Carnicería Central' : 
                       selectedOrder.supplierId === 'sup-2' ? 'Panadería' : 'Verdurería'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{selectedOrder.items.length}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Formulario de recepción (placeholder - implementar formulario completo)
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleReceiveOrder({
                      purchaseOrderId: selectedOrder.id,
                      receivedDate: new Date(),
                      receivedBy: 'user-1',
                      notes: 'Recepción completa',
                      items: selectedOrder.items.map(item => ({
                        purchaseOrderItemId: item.id,
                        receivedQuantity: item.quantity,
                        unitCost: item.unitPrice,
                        expiryDate: new Date(),
                        batchNumber: 'BATCH-001',
                        location: 'Almacén 1',
                        notes: ''
                      }))
                    })
                  }}
                  className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover"
                >
                  Recibir Orden
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
