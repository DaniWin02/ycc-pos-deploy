import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, RotateCcw, AlertCircle, Trash2, X, Users } from 'lucide-react'
import { useKdsStore, KdsTicket } from '../stores/useKdsStore'

interface KdsHistoryProps {
  selectedStationId: string | null
}

export function KdsHistory({ selectedStationId }: KdsHistoryProps) {
  const { tickets, markAsReady, returnToActive, bumpTicket, deleteTicket, permanentDeleteTicket } = useKdsStore()

  // Filtrar tickets en historial (PREPARING y READY)
  const historyTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Solo mostrar tickets en preparación o listos
      if (ticket.status !== 'PREPARING' && ticket.status !== 'READY') return false
      if (ticket.deletedAt) return false

      // Si hay filtro por estación, verificar que tenga items de esa estación
      if (selectedStationId) {
        return ticket.items.some(item => item.stationId === selectedStationId)
      }

      return true
    }).sort((a, b) => {
      // Ordenar por fecha de creación (más antiguos primero)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }, [tickets, selectedStationId])

  // Calcular tiempo transcurrido
  const getElapsedTime = (createdAt: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(createdAt).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    return minutes
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (historyTickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--muted-foreground)' }}>
        <AlertCircle className="w-16 h-16 mb-3 opacity-20" />
        <p className="text-lg font-bold">Historial Vacío</p>
        <p className="text-sm opacity-60">
          {selectedStationId 
            ? 'No hay pedidos pendientes en esta estación'
            : 'Los pedidos en proceso aparecerán aquí'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-8">
      {historyTickets.map((ticket) => {
        const elapsedMinutes = getElapsedTime(ticket.createdAt)
        const visibleItems = selectedStationId
          ? ticket.items.filter(item => item.stationId === selectedStationId)
          : ticket.items

        return (
          <motion.div
            key={ticket.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
              rounded-2xl border-2 p-5 shadow-lg transition-all
            `}
            style={{ 
              backgroundColor: 'var(--card)', 
              borderColor: ticket.status === 'PREPARING' ? 'var(--warning)' : 'var(--success)',
              color: 'var(--foreground)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black tracking-tighter">
                  #{ticket.folio}
                </span>
                <span className={`
                  px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm
                  ${ticket.status === 'PREPARING' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-green-100 text-green-700'
                  }
                `}>
                  {ticket.status === 'PREPARING' ? 'PREPARANDO' : 'LISTO'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-bold opacity-60">
                <Clock className="w-4 h-4" />
                <span>{formatTime(elapsedMinutes)}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-6">
              {visibleItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center font-black bg-opacity-10 text-sm" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary)' }}>{item.quantity}x</span>
                    <span className="font-bold text-base leading-tight">{item.name}</span>
                  </div>
                  {item.notes && (
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">⚠️ {item.notes}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Info adicional */}
            {(ticket.table || ticket.waiter) && (
              <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider mb-6 opacity-40">
                {ticket.table && (
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Mesa: {ticket.table}</span>
                )}
                {ticket.waiter && (
                  <span>Mesero: {ticket.waiter}</span>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-2">
              {ticket.status === 'PREPARING' && (
                <button
                  onClick={() => markAsReady(ticket.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black py-3 px-4 rounded-xl transition-all active:scale-95 shadow-md"
                >
                  <CheckCircle className="w-5 h-5" />
                  LISTO
                </button>
              )}
              
              <button
                onClick={() => returnToActive(ticket.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-black py-3 px-4 rounded-xl transition-all active:scale-95 shadow-md"
              >
                <RotateCcw className="w-5 h-5" />
                COMANDAS
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar comanda ${ticket.folio} permanentemente?`)) {
                    permanentDeleteTicket(ticket.id)
                  }
                }}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-black py-3 px-4 rounded-xl transition-all active:scale-95 shadow-md"
                title="Eliminar comanda"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
