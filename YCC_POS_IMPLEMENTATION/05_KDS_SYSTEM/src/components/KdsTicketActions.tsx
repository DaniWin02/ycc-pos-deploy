import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Clock, ChefHat, RotateCcw, Package } from 'lucide-react'
import type { KdsTicket as KdsTicketType } from '@ycc/types'
import { useKdsStore } from '../stores/useKdsStore'

interface KdsTicketActionsProps {
  ticket: KdsTicketType
  completedItems: number
  totalItems: number
}

export function KdsTicketActions({ ticket, completedItems, totalItems }: KdsTicketActionsProps) {
  const { updateTicket, moveToHistory, bumpTicket, returnToActive } = useKdsStore()

  const isComplete = completedItems === totalItems && totalItems > 0
  const canComplete = isComplete && ticket.status !== 'SERVED'

  // Enviar al historial (empezar a preparar)
  const handleStartPreparing = () => {
    moveToHistory(ticket.id)
  }

  // Completar/Despachar ticket (marcar como SERVED)
  const handleBumpTicket = () => {
    if (window.confirm(`¿Despachar ticket ${ticket.folio}?`)) {
      bumpTicket(ticket.id)
    }
  }

  // Regresar a comandas activas
  const handleReturnToActive = () => {
    returnToActive(ticket.id)
  }

  const handleCancelTicket = () => {
    if (window.confirm(`¿Cancelar ticket ${ticket.folio}? Esta acción no se puede deshacer.`)) {
      updateTicket(ticket.id, {
        status: 'CANCELLED',
        completedAt: new Date()
      })
    }
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

        {/* Acciones según el estado */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Estado NEW: Botón Preparar y Cancelar */}
          {ticket.status === 'NEW' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartPreparing}
                className="kds-button bg-amber-600 hover:bg-amber-700 text-white flex items-center space-x-1"
              >
                <ChefHat className="w-4 h-4" />
                <span>Preparar</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelTicket}
                className="kds-button bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancelar</span>
              </motion.button>
            </>
          )}

          {/* Estado PREPARING: Botón Completar y Regresar */}
          {ticket.status === 'PREPARING' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBumpTicket}
                className="kds-button kds-button-primary flex items-center space-x-1"
              >
                <Package className="w-4 h-4" />
                <span>Completar</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReturnToActive}
                className="kds-button bg-gray-600 hover:bg-gray-700 text-white flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Regresar</span>
              </motion.button>
            </>
          )}

          {/* Estado READY: Botón Despachar y Regresar */}
          {ticket.status === 'READY' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBumpTicket}
                className="kds-button bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Despachar</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReturnToActive}
                className="kds-button bg-gray-600 hover:bg-gray-700 text-white flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Regresar</span>
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Indicador de estado especial */}
      {ticket.status === 'PREPARING' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-amber-500/20 border border-amber-500/50 rounded-lg p-2"
        >
          <div className="flex items-center space-x-2 text-amber-600 text-sm">
            <ChefHat className="w-4 h-4" />
            <span>En preparación - Ticket en el historial</span>
          </div>
        </motion.div>
      )}

      {ticket.status === 'READY' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-green-500/20 border border-green-500/50 rounded-lg p-2"
        >
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Listo para despachar</span>
          </div>
        </motion.div>
      )}

      {/* Indicador de urgencia */}
      {ticket.priority === 'HIGH' && ticket.status !== 'SERVED' && (
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
