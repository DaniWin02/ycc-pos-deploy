import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import type { KdsTicket as KdsTicketType } from '@ycc/types'
import { useKdsStore } from '../stores/useKdsStore'

interface KdsTicketActionsProps {
  ticket: KdsTicketType
  completedItems: number
  totalItems: number
}

export function KdsTicketActions({ ticket, completedItems, totalItems }: KdsTicketActionsProps) {
  const { updateTicket } = useKdsStore()

  const isComplete = completedItems === totalItems && totalItems > 0
  const canComplete = isComplete && ticket.status !== 'COMPLETED'

  const handleCompleteTicket = () => {
    updateTicket(ticket.id, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
    })
  }

  const handleCancelTicket = () => {
    if (window.confirm(`¿Cancelar ticket ${ticket.folio}? Esta acción no se puede deshacer.`)) {
      updateTicket(ticket.id, {
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString()
      })
    }
  }

  const handlePauseTicket = () => {
    updateTicket(ticket.id, {
      status: ticket.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED'
    })
  }

  return (
    <div className="border-t border-kds-border p-4 bg-kds-header">
      <div className="flex items-center justify-between">
        {/* Estado del ticket */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isComplete ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-500" />
            )}
            <span className="text-sm font-medium text-kds-text">
              {isComplete ? 'Completado' : 'En progreso'}
            </span>
          </div>
          
          <div className="text-sm text-kds-secondary">
            {completedItems}/{totalItems} items listos
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          {/* Botón de pausar/reanudar */}
          {ticket.status !== 'COMPLETED' && ticket.status !== 'CANCELLED' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePauseTicket}
              className={`
                kds-button flex items-center space-x-1
                ${ticket.status === 'PAUSED' 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
                }
              `}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{ticket.status === 'PAUSED' ? 'Reanudar' : 'Pausar'}</span>
            </motion.button>
          )}

          {/* Botón de completar */}
          {canComplete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCompleteTicket}
              className="kds-button kds-button-primary flex items-center space-x-1"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Completar</span>
            </motion.button>
          )}

          {/* Botón de cancelar */}
          {ticket.status !== 'COMPLETED' && ticket.status !== 'CANCELLED' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancelTicket}
              className="kds-button bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancelar</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Indicador de estado especial */}
      {ticket.status === 'PAUSED' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2"
        >
          <div className="flex items-center space-x-2 text-yellow-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Ticket pausado - No se está trabajando en este pedido</span>
          </div>
        </motion.div>
      )}

      {/* Indicador de urgencia */}
      {ticket.priority === 'HIGH' && ticket.status !== 'COMPLETED' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-red-500/20 border border-red-500/50 rounded-lg p-2"
        >
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Pedido urgente - Prioridad alta</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
