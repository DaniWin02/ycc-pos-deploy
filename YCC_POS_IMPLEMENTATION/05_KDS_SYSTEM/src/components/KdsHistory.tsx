import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react'
import { useKdsStore, KdsTicket } from '../stores/useKdsStore'

interface KdsHistoryProps {
  selectedStationId: string | null
}

export function KdsHistory({ selectedStationId }: KdsHistoryProps) {
  const { tickets, markAsReady, returnToActive } = useKdsStore()

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
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <AlertCircle className="w-16 h-16 mb-3" />
        <p className="text-lg font-medium">Sin pedidos en historial</p>
        <p className="text-sm">
          {selectedStationId 
            ? 'No hay pedidos en preparación para esta estación'
            : 'Los pedidos en preparación aparecerán aquí'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {historyTickets.map((ticket) => {
        const elapsedMinutes = getElapsedTime(ticket.createdAt)
        const visibleItems = selectedStationId
          ? ticket.items.filter(item => item.stationId === selectedStationId)
          : ticket.items

        return (
          <motion.div
            key={ticket.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`
              bg-white rounded-lg border-2 p-4 shadow-sm
              ${ticket.status === 'PREPARING' ? 'border-amber-300' : 'border-green-300'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  #{ticket.folio}
                </span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-bold
                  ${ticket.status === 'PREPARING' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-green-100 text-green-700'
                  }
                `}>
                  {ticket.status === 'PREPARING' ? 'EN PREPARACIÓN' : 'LISTO'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatTime(elapsedMinutes)}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-3">
              {visibleItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">{item.quantity}x</span>
                    <span className="text-gray-900">{item.name}</span>
                  </div>
                  {item.notes && (
                    <span className="text-xs text-gray-500 italic">{item.notes}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Info adicional */}
            {(ticket.table || ticket.waiter) && (
              <div className="flex items-center gap-4 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-200">
                {ticket.table && (
                  <span>Mesa: <strong>{ticket.table}</strong></span>
                )}
                {ticket.waiter && (
                  <span>Mesero: <strong>{ticket.waiter}</strong></span>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-2">
              {ticket.status === 'PREPARING' && (
                <button
                  onClick={() => markAsReady(ticket.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Marcar como Listo
                </button>
              )}
              
              <button
                onClick={() => returnToActive(ticket.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Regresar a Comandas
              </button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
