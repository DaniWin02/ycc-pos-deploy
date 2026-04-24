import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, AlertTriangle, Check, X, ArrowDown, Trash2 } from 'lucide-react'
import { useKdsStore, KdsTicket as KdsTicketType, KdsItemStatus } from '../stores/useKdsStore'
import { useResponsive } from '../hooks/useResponsive'

interface KdsTicketProps {
  ticket: KdsTicketType
  selectedStationId?: string | null  // Si se proporciona, mostrar SOLO items de esta estación
}

export function KdsTicketNew({ ticket, selectedStationId }: KdsTicketProps) {
  const { bumpTicket, deleteTicket, moveToHistory, updateItemStatus, permanentDeleteTicket } = useKdsStore()
  const { isMobile } = useResponsive()

  // FILTRAR ITEMS: Si hay estación seleccionada, mostrar SOLO items de esa estación
  const visibleItems = selectedStationId
    ? ticket.items.filter(item => item.stationId === selectedStationId)
    : ticket.items

  // Calcular tiempo transcurrido
  const elapsedMinutes = useMemo(() => {
    const created = new Date(ticket.createdAt)
    const now = new Date()
    const diff = now.getTime() - created.getTime()
    return Math.floor(diff / (1000 * 60))
  }, [ticket.createdAt])

  // Determinar clase de color del timer
  const getTimerClass = () => {
    if (elapsedMinutes > 15) return 'text-red-600 animate-pulse'
    if (elapsedMinutes > 10) return 'text-amber-500'
    return 'text-green-600'
  }

  // Formatear tiempo
  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes)
    const secs = Math.floor((minutes - mins) * 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // Determinar si es urgente
  const isUrgent = elapsedMinutes > 15

  // Configuración de badges de estado - ahora con clases Tailwind
  const statusConfig = {
    NEW: { label: 'NUEVO', bgClass: 'bg-blue-500', textClass: 'text-white' },
    PREPARING: { label: 'PREPARANDO', bgClass: 'bg-amber-500', textClass: 'text-white' },
    READY: { label: 'LISTO', bgClass: 'bg-green-500', textClass: 'text-white' },
    SERVED: { label: 'SERVIDO', bgClass: 'bg-gray-400', textClass: 'text-white' },
    CANCELLED: { label: 'CANCELADO', bgClass: 'bg-red-500', textClass: 'text-white' }
  }

  const currentStatus = statusConfig[ticket.status]

  // Manejar acciones
  const handleMarkReady = () => {
    if (ticket.status === 'PREPARING') {
      bumpTicket(ticket.id)
    }
  }

  const handleComplete = () => {
    if (ticket.status === 'READY') {
      bumpTicket(ticket.id)
    }
  }

  const handleCancel = () => {
    if (window.confirm('¿Cancelar este pedido?')) {
      deleteTicket(ticket.id)
    }
  }

  // Verificar si todos los items están listos
  const allItemsReady = visibleItems.every(item => item.status === 'READY')
  const someItemsReady = visibleItems.some(item => item.status === 'READY')

  // Manejar click en item para cambiar estado
  const handleItemClick = (itemId: string, currentStatus: KdsItemStatus) => {
    if (ticket.status === 'SERVED' || ticket.status === 'CANCELLED') return
    
    // Ciclar estado: PENDING → PREPARING → READY → PENDING
    const nextStatus: KdsItemStatus = 
      currentStatus === 'PENDING' ? 'PREPARING' : 
      currentStatus === 'PREPARING' ? 'READY' : 
      'PENDING'
    
    updateItemStatus(ticket.id, itemId, nextStatus)
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className={`
        bg-white rounded-2xl shadow-lg overflow-hidden border-2
        ${isUrgent ? 'border-red-500 ring-4 ring-red-200 animate-pulse' : 'border-gray-200'}
      `}
    >
      {/* Header con timer y badge de estado */}
      <div className="p-fluid-sm sm:p-fluid-md bg-white border-b-2 border-gray-100">
        <div className="flex items-start justify-between mb-2">
          {/* Timer prominente */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Clock className={`w-5 h-5 sm:w-6 sm:h-6 ${getTimerClass()}`} />
            <span className={`text-fluid-xl sm:text-fluid-2xl font-bold ${getTimerClass()}`}>
              {elapsedMinutes}min
            </span>
          </div>

          {/* Badge de estado */}
          <div 
            className={`${currentStatus.bgClass} ${currentStatus.textClass} px-2 sm:px-3 py-1 rounded-lg text-fluid-xs font-bold`}
          >
            {currentStatus.label}
          </div>
        </div>

        {/* Folio y Mesa + Botón Cerrar */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-fluid-lg sm:text-fluid-xl font-bold text-gray-900">
              {ticket.folio}
            </h3>
            {ticket.table && (
              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <span className="text-fluid-sm sm:text-fluid-base font-semibold text-gray-700">
                  {ticket.table}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Indicador de urgencia */}
            {isUrgent && (
              <div className="bg-red-500 text-white p-1.5 sm:p-2 rounded-full">
                <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            )}
            
            {/* Botón Cerrar/Cancelar comanda individual */}
            <button
              onClick={() => {
                if (window.confirm(`¿Cancelar comanda ${ticket.folio}?`)) {
                  deleteTicket(ticket.id)
                }
              }}
              className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 sm:p-2 rounded-full transition-colors active:scale-95"
              title="Cancelar comanda"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Cliente/Mesero */}
        {(ticket.cliente || ticket.waiter) && (
          <div className="mt-2 text-fluid-xs sm:text-fluid-sm text-gray-600">
            {ticket.cliente && <span className="font-medium">👤 {ticket.cliente}</span>}
            {ticket.waiter && <span className="ml-2 sm:ml-3">🍽️ {ticket.waiter}</span>}
          </div>
        )}
      </div>

      {/* Lista de items - CLICKEABLES para subrayar individualmente */}
      <div className="p-fluid-sm sm:p-fluid-md bg-white max-h-48 sm:max-h-64 overflow-y-auto kds-scrollbar">
        <div className="space-y-2 sm:space-y-3">
          {visibleItems.map((item, index) => (
            <div 
              key={item.id}
              onClick={() => handleItemClick(item.id, item.status)}
              className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border cursor-pointer transition-all active:scale-95 ${
                item.status === 'READY' 
                  ? 'bg-green-50 border-green-300 opacity-70' 
                  : item.status === 'PREPARING'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {/* Cantidad destacada */}
              <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-fluid-base sm:text-fluid-lg ${
                item.status === 'READY' 
                  ? 'bg-green-600 text-white' 
                  : item.status === 'PREPARING'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-400 text-white'
              }`}>
                {item.quantity}
              </div>

              {/* Nombre del item - con subrayado cuando está listo */}
              <div className="flex-1 min-w-0">
                <p className={`text-fluid-sm sm:text-fluid-base font-semibold leading-tight ${
                  item.status === 'READY' 
                    ? 'text-gray-500 line-through decoration-2 decoration-green-500' 
                    : 'text-gray-900'
                }`}>
                  {item.name}
                  {item.stationId && selectedStationId === null && (
                    <span className="ml-1 sm:ml-2 text-fluid-xs text-gray-500 font-normal">
                      ({item.stationId.substring(0, 6)}...)
                    </span>
                  )}
                </p>
                {item.notes && (
                  <p className={`text-fluid-xs mt-1 italic ${
                    item.status === 'READY' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Estado del item con badge */}
              <div className="flex-shrink-0">
                {item.status === 'READY' ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                ) : item.status === 'PREPARING' ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción grandes */}
      <div className="p-fluid-sm sm:p-fluid-md bg-gray-50 border-t-2 border-gray-200">
        {ticket.status === 'NEW' && (
          <div className="space-y-2">
            {/* Indicador de estado - no es botón, solo informativo */}
            {!allItemsReady ? (
              <div className="kds-touch-comfortable bg-gray-100 text-gray-600 w-full flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-base">
                <span>👆 Click en items para marcar listos</span>
              </div>
            ) : (
              <div className="kds-touch-comfortable bg-green-100 text-green-700 border-2 border-green-400 w-full flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-base">
                <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>✅ Todos los items listos</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => moveToHistory(ticket.id)}
                className="kds-touch-comfortable bg-amber-600 hover:bg-amber-700 text-white flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-base active:scale-95 transition-all"
              >
                <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>En Preparación</span>
              </button>
              <button
                onClick={handleCancel}
                className="kds-touch-comfortable bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded-xl active:scale-95 transition-all px-4"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        )}

        {ticket.status === 'PREPARING' && (
          <div className="space-y-2">
            {/* Indicador de estado - no es botón, solo informativo */}
            {!allItemsReady ? (
              <div className="kds-touch-comfortable bg-gray-100 text-gray-600 w-full flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-base">
                <span>👆 Click en items para marcar listos</span>
              </div>
            ) : (
              <div className="kds-touch-comfortable bg-green-100 text-green-700 border-2 border-green-400 w-full flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-base">
                <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>✅ Todos los items listos</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleMarkReady}
                className="kds-touch-comfortable bg-green-600 hover:bg-green-700 text-white flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-base active:scale-95 transition-all"
              >
                <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Marcar Todo Listo</span>
              </button>
              <button
                onClick={handleCancel}
                className="kds-touch-comfortable bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded-xl active:scale-95 transition-all px-4"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        )}

        {ticket.status === 'READY' && (
          <button
            onClick={handleComplete}
            className="kds-touch-comfortable bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-base active:scale-95 transition-all"
          >
            <Check className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Entregar</span>
          </button>
        )}

        {(ticket.status === 'SERVED' || ticket.status === 'CANCELLED') && (
          <div className="space-y-2">
            <div className="text-center py-1">
              <span className="text-gray-500 font-medium text-fluid-sm">
                {ticket.status === 'SERVED' ? '✓ Completado' : '✕ Cancelado'}
              </span>
            </div>
            <button
              onClick={() => {
                if (window.confirm(`¿Eliminar comanda ${ticket.folio} permanentemente?`)) {
                  permanentDeleteTicket(ticket.id)
                }
              }}
              className="kds-touch-comfortable bg-red-600 hover:bg-red-700 text-white w-full flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-base active:scale-95 transition-all"
            >
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Eliminar</span>
            </button>
          </div>
        )}
      </div>

      {/* Barra de progreso en la parte inferior */}
      {ticket.status !== 'SERVED' && ticket.status !== 'CANCELLED' && (
        <div className="h-2 bg-gray-200">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ 
              width: ticket.status === 'NEW' ? '0%' : 
                     ticket.status === 'PREPARING' ? '50%' : 
                     ticket.status === 'READY' ? '100%' : '0%'
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  )
}
