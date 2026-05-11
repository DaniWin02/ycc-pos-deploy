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
    if (elapsedMinutes > 15) return 'text-[var(--danger)] animate-pulse'
    if (elapsedMinutes > 10) return 'text-[var(--warning)]'
    return 'text-[var(--success)]'
  }

  // Determinar si es urgente
  const isUrgent = elapsedMinutes > 15

  // Configuración de badges de estado
  const statusConfig = {
    NEW: { label: 'NUEVO', bgClass: 'bg-[var(--info)]', textClass: 'text-[var(--info-foreground)]' },
    PREPARING: { label: 'PREPARANDO', bgClass: 'bg-[var(--warning)]', textClass: 'text-[var(--warning-foreground)]' },
    READY: { label: 'LISTO', bgClass: 'bg-[var(--success)]', textClass: 'text-[var(--success-foreground)]' },
    SERVED: { label: 'SERVIDO', bgClass: 'bg-[var(--muted)]', textClass: 'text-[var(--muted-foreground)]' },
    CANCELLED: { label: 'CANCELADO', bgClass: 'bg-[var(--danger)]', textClass: 'text-[var(--danger-foreground)]' }
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
        rounded-2xl shadow-lg overflow-hidden border-2 flex flex-col h-full transition-colors duration-300
        ${isUrgent ? 'border-[var(--danger)] ring-4 ring-[var(--danger-light)] animate-pulse' : ''}
      `}
      style={{ 
        backgroundColor: 'var(--card)', 
        borderColor: isUrgent ? '#ef4444' : 'var(--border)',
        color: 'var(--foreground)'
      }}
    >
      {/* Header con timer y badge de estado */}
      <div className="p-fluid-sm sm:p-fluid-md border-b-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
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
            className={`${currentStatus.bgClass} ${currentStatus.textClass} px-2 sm:px-3 py-1 rounded-lg text-fluid-xs font-bold shadow-sm`}
          >
            {currentStatus.label}
          </div>
        </div>

        {/* Folio y Mesa + Botón Cerrar */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-fluid-lg sm:text-fluid-xl font-bold" style={{ color: 'var(--foreground)' }}>
              {ticket.folio}
            </h3>
            {ticket.table && (
              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--muted-foreground)' }} />
                <span className="text-fluid-sm sm:text-fluid-base font-semibold opacity-80">
                  {ticket.table}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Indicador de urgencia */}
            {isUrgent && (
              <div className="bg-[var(--danger)] text-[var(--danger-foreground)] p-1.5 sm:p-2 rounded-full shadow-lg">
                <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            )}
            
            {/* Botón Cerrar/Cancelar comanda individual */}
            <button
              onClick={handleCancel}
              className="bg-[var(--danger-light)] hover:bg-[var(--danger)] text-[var(--danger)] p-1.5 sm:p-2 rounded-full transition-colors active:scale-95 border border-[var(--danger)]"
              title="Cancelar comanda"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Cliente/Mesero */}
        {(ticket.cliente || ticket.waiter) && (
          <div className="mt-2 text-fluid-xs sm:text-fluid-sm" style={{ color: 'var(--muted-foreground)' }}>
            {ticket.cliente && <span className="font-medium">👤 {ticket.cliente}</span>}
            {ticket.waiter && <span className="ml-2 sm:ml-3">🍽️ {ticket.waiter}</span>}
          </div>
        )}
      </div>

      {/* Lista de items - CLICKEABLES para subrayar individualmente */}
      <div className="p-fluid-sm sm:p-fluid-md flex-1 min-h-0 overflow-y-auto kds-scrollbar" style={{ backgroundColor: 'var(--background)' }}>
        <div className="space-y-2 sm:space-y-3">
          {visibleItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => handleItemClick(item.id, item.status)}
              className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-95 ${
                item.status === 'READY' 
                  ? 'bg-[var(--success)]/10 border-[var(--success)]/50 opacity-70' 
                  : item.status === 'PREPARING'
                  ? 'bg-[var(--warning)]/10 border-[var(--warning)]/50'
                  : 'hover:border-[var(--info)]'
              }`}
              style={{ 
                backgroundColor: item.status === 'PENDING' ? 'var(--card)' : '',
                borderColor: item.status === 'PENDING' ? 'var(--border)' : ''
              }}
            >
              {/* Cantidad destacada */}
              <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-fluid-base sm:text-fluid-lg shadow-sm ${
                item.status === 'READY' 
                  ? 'bg-[var(--success)] text-[var(--success-foreground)]' 
                  : item.status === 'PREPARING'
                  ? 'bg-[var(--warning)] text-[var(--warning-foreground)]'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
              }`}>
                {item.quantity}
              </div>

              {/* Nombre del item - con subrayado cuando está listo */}
              <div className="flex-1 min-w-0">
                <p className={`text-fluid-sm sm:text-fluid-base font-semibold leading-tight ${
                  item.status === 'READY' 
                    ? 'text-[var(--muted-foreground)] line-through decoration-2 decoration-[var(--success)]' 
                    : ''
                }`} style={{ color: item.status === 'READY' ? '' : 'var(--foreground)' }}>
                  {item.name}
                </p>
                {/* Notas de item */}
                {item.notes && (
                  <p className="text-[10px] sm:text-fluid-xs font-bold text-[var(--danger)] mt-1 uppercase italic">
                    ⚠️ {item.notes}
                  </p>
                )}
                {/* Modificadores */}
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.modifiers.map((mod, i) => (
                      <span 
                        key={i} 
                        className="text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded uppercase border"
                        style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
                      >
                        + {mod.modifierName}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Estado del item con badge */}
              <div className="flex-shrink-0">
                {item.status === 'READY' ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[var(--success)] rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--success-foreground)]" />
                  </div>
                ) : item.status === 'PREPARING' ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[var(--warning)] rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    <div className="w-2 h-2 bg-[var(--warning-foreground)] rounded-full" />
                  </div>
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: 'var(--foreground)' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción grandes - SIEMPRE VISIBLES */}
      <div className="p-fluid-sm sm:p-fluid-md border-t-2 flex-shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {ticket.status === 'NEW' && (
          <div className="space-y-2">
            {!allItemsReady ? (
              <div className="h-10 sm:h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-xs sm:text-fluid-sm border-2 border-dashed" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
                <span>👆 Marcar items para procesar</span>
              </div>
            ) : (
              <div className="h-10 sm:h-12 bg-[var(--success-light)] text-[var(--success)] border-2 border-[var(--success)] w-full flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-xs sm:text-fluid-sm shadow-inner">
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>TODO LISTO</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => moveToHistory(ticket.id)}
                className="h-12 sm:h-14 bg-[var(--warning)] hover:bg-[var(--warning)] text-[var(--warning-foreground)] flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-sm sm:text-fluid-base active:scale-95 transition-all shadow-md"
              >
                <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>PREPARAR</span>
              </button>
              <button
                onClick={handleCancel}
                className="h-12 sm:h-14 bg-[var(--danger)] hover:bg-[var(--danger)] text-[var(--danger-foreground)] flex items-center justify-center rounded-xl active:scale-95 transition-all px-4 shadow-md"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        )}

        {ticket.status === 'PREPARING' && (
          <div className="space-y-2">
            {!allItemsReady ? (
              <div className="h-10 sm:h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-xs sm:text-fluid-sm border-2 border-dashed" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
                <span>👆 Finalizar items faltantes</span>
              </div>
            ) : (
              <div className="h-10 sm:h-12 bg-[var(--success-light)] text-[var(--success)] border-2 border-[var(--success)] w-full flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-xs sm:text-fluid-sm shadow-inner">
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>LISTO PARA ENTREGA</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleMarkReady}
                className={`h-12 sm:h-14 flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-sm sm:text-fluid-base active:scale-95 transition-all shadow-md ${
                  allItemsReady ? 'bg-[var(--success)] hover:bg-[var(--success)] text-[var(--success-foreground)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
                }`}
                disabled={!allItemsReady}
              >
                <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>TERMINAR</span>
              </button>
              <button
                onClick={handleCancel}
                className="h-12 sm:h-14 bg-[var(--danger)] hover:bg-[var(--danger)] text-[var(--danger-foreground)] flex items-center justify-center rounded-xl active:scale-95 transition-all px-4 shadow-md"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        )}

        {ticket.status === 'READY' && (
          <button
            onClick={handleComplete}
            className="h-12 sm:h-14 bg-[var(--info)] hover:bg-[var(--info)] text-[var(--info-foreground)] w-full flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-sm sm:text-fluid-base active:scale-95 transition-all shadow-lg"
          >
            <Check className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>ENTREGAR</span>
          </button>
        )}

        {(ticket.status === 'SERVED' || ticket.status === 'CANCELLED') && (
          <div className="space-y-2">
            <div className="text-center py-1">
              <span className="font-bold text-fluid-xs uppercase opacity-50" style={{ color: 'var(--foreground)' }}>
                {ticket.status === 'SERVED' ? '✓ Pedido Servido' : '✕ Pedido Cancelado'}
              </span>
            </div>
            <button
              onClick={() => {
                if (window.confirm(`¿Eliminar comanda ${ticket.folio} permanentemente?`)) {
                  permanentDeleteTicket(ticket.id)
                }
              }}
              className="h-12 sm:h-14 bg-red-600 hover:bg-red-700 text-white w-full flex items-center justify-center gap-2 rounded-xl font-bold text-fluid-base active:scale-95 transition-all shadow-md"
            >
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>ELIMINAR</span>
            </button>
          </div>
        )}
      </div>

      {/* Barra de progreso en la parte inferior */}
      {ticket.status !== 'SERVED' && ticket.status !== 'CANCELLED' && (
        <div className="h-1.5" style={{ backgroundColor: 'var(--muted)' }}>
          <motion.div
            className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
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
