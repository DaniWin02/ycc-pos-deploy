import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, AlertTriangle, Play, Check, X, ArrowDown } from 'lucide-react'
import { useKdsStore, KdsTicket as KdsTicketType } from '../stores/useKdsStore'

interface KdsTicketProps {
  ticket: KdsTicketType
  selectedStationId?: string | null  // Si se proporciona, mostrar SOLO items de esta estación
}

export function KdsTicketNew({ ticket, selectedStationId }: KdsTicketProps) {
  const { bumpTicket, deleteTicket, moveToHistory } = useKdsStore()

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
    if (elapsedMinutes > 15) return 'timer-red'
    if (elapsedMinutes > 10) return 'timer-yellow'
    return 'timer-green'
  }

  // Formatear tiempo
  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes)
    const secs = Math.floor((minutes - mins) * 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // Determinar si es urgente
  const isUrgent = elapsedMinutes > 15

  // Configuración de badges de estado
  const statusConfig = {
    NEW: { label: 'NUEVO', class: 'badge-new', bgColor: '#3b82f6' },
    PREPARING: { label: 'PREPARANDO', class: 'badge-preparing', bgColor: '#f59e0b' },
    READY: { label: 'LISTO', class: 'badge-ready', bgColor: '#22c55e' },
    SERVED: { label: 'SERVIDO', class: 'badge-served', bgColor: '#9ca3af' },
    CANCELLED: { label: 'CANCELADO', class: 'badge-served', bgColor: '#ef4444' }
  }

  const currentStatus = statusConfig[ticket.status]

  // Manejar acciones
  const handleStartPreparing = () => {
    if (ticket.status === 'NEW') {
      bumpTicket(ticket.id)
    }
  }

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

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className={`
        card-tablet overflow-hidden
        ${isUrgent ? 'ring-4 ring-red-500 ring-opacity-50 animate-pulse' : ''}
      `}
    >
      {/* Header con timer y badge de estado */}
      <div className="p-4 md:p-6 bg-white border-b-2 border-gray-100">
        <div className="flex items-start justify-between mb-3">
          {/* Timer prominente */}
          <div className="flex items-center gap-2">
            <Clock className={`w-6 h-6 ${getTimerClass()}`} />
            <span className={`text-2xl md:text-3xl font-bold ${getTimerClass()}`}>
              {elapsedMinutes}min
            </span>
          </div>

          {/* Badge de estado */}
          <div 
            className={currentStatus.class}
            style={{ fontSize: '14px', padding: '6px 16px' }}
          >
            {currentStatus.label}
          </div>
        </div>

        {/* Folio y Mesa */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              {ticket.folio}
            </h3>
            {ticket.table && (
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-base md:text-lg font-semibold text-gray-700">
                  {ticket.table}
                </span>
              </div>
            )}
          </div>

          {/* Indicador de urgencia */}
          {isUrgent && (
            <div className="bg-red-500 text-white p-2 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Cliente/Mesero */}
        {(ticket.cliente || ticket.waiter) && (
          <div className="mt-2 text-sm text-gray-600">
            {ticket.cliente && <span>Cliente: {ticket.cliente}</span>}
            {ticket.waiter && <span className="ml-3">Mesero: {ticket.waiter}</span>}
          </div>
        )}
      </div>

      {/* Lista de items - FILTRADOS por estación si aplica */}
      <div className="p-4 md:p-6 bg-white max-h-80 overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {visibleItems.map((item, index) => (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200"
            >
              {/* Cantidad destacada */}
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                {item.quantity}
              </div>

              {/* Nombre del item */}
              <div className="flex-1 min-w-0">
                <p className="text-base md:text-lg font-semibold text-gray-900 leading-tight">
                  {item.name}
                  {item.stationId && selectedStationId === null && (
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      ({item.stationId.substring(0, 8)}...)
                    </span>
                  )}
                </p>
                {item.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Estado del item */}
              <div className="flex-shrink-0">
                {item.status === 'READY' ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                ) : item.status === 'PREPARING' ? (
                  <div className="w-8 h-8 bg-amber-500 rounded-full animate-pulse" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción grandes */}
      <div className="p-4 md:p-6 bg-gray-50 border-t-2 border-gray-200">
        {ticket.status === 'NEW' && (
          <div className="space-y-2">
            <button
              onClick={() => moveToHistory(ticket.id)}
              className="btn-tablet bg-amber-600 hover:bg-amber-700 text-white w-full flex items-center justify-center gap-2"
              style={{ minHeight: '56px' }}
            >
              <ArrowDown className="w-6 h-6" />
              <span className="text-lg font-bold">Subrayar / En Preparación</span>
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleStartPreparing}
                className="btn-tablet btn-success flex-1 flex items-center justify-center gap-2"
                style={{ minHeight: '56px' }}
              >
                <Play className="w-6 h-6" />
                <span className="text-lg font-bold">Iniciar</span>
              </button>
              <button
                onClick={handleCancel}
                className="btn-tablet btn-danger flex items-center justify-center"
                style={{ minHeight: '56px', minWidth: '56px' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {ticket.status === 'PREPARING' && (
          <div className="flex gap-3">
            <button
              onClick={handleMarkReady}
              className="btn-tablet btn-success flex-1 flex items-center justify-center gap-2"
              style={{ minHeight: '56px' }}
            >
              <Check className="w-6 h-6" />
              <span className="text-lg font-bold">Marcar Listo</span>
            </button>
            <button
              onClick={handleCancel}
              className="btn-tablet btn-danger flex items-center justify-center"
              style={{ minHeight: '56px', minWidth: '56px' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {ticket.status === 'READY' && (
          <button
            onClick={handleComplete}
            className="btn-tablet btn-primary w-full flex items-center justify-center gap-2"
            style={{ minHeight: '56px' }}
          >
            <Check className="w-6 h-6" />
            <span className="text-lg font-bold">Completar Entrega</span>
          </button>
        )}

        {(ticket.status === 'SERVED' || ticket.status === 'CANCELLED') && (
          <div className="text-center py-3">
            <span className="text-gray-500 font-medium">
              {ticket.status === 'SERVED' ? '✓ Pedido completado' : '✕ Pedido cancelado'}
            </span>
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
