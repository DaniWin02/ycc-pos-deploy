import React from 'react'
import { motion } from 'framer-motion'
import { Clock, User, AlertTriangle } from 'lucide-react'
import type { KdsTicket as KdsTicketType, KdsItemStatus } from '@ycc/types'
import { KdsTicketHeader } from './KdsTicketHeader'
import { KdsTicketItem } from './KdsTicketItem'
import { KdsTicketActions } from './KdsTicketActions'
import { useKdsStore } from '../stores/useKdsStore'

interface KdsTicketProps {
  ticket: KdsTicketType
}

export function KdsTicket({ ticket }: KdsTicketProps) {
  const { updateItemStatus } = useKdsStore()

  // Calcular tiempo transcurrido
  const elapsedMinutes = React.useMemo(() => {
    const created = new Date(ticket.createdAt)
    const now = new Date()
    const diff = now.getTime() - created.getTime()
    return Math.floor(diff / (1000 * 60))
  }, [ticket.createdAt])

  // Determinar color del timer
  const getTimerColor = () => {
    if (elapsedMinutes > 15) return 'kds-timer-pulse'
    if (elapsedMinutes > 10) return 'kds-timer-red'
    if (elapsedMinutes > 5) return 'kds-timer-yellow'
    return 'kds-timer-green'
  }

  // Calcular progreso de items
  const completedItems = ticket.items.filter(item => item.status === 'READY').length
  const totalItems = ticket.items.length
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  // Manejar cambio de estado de item
  const handleItemStatusChange = (itemId: string, status: KdsItemStatus) => {
    updateItemStatus(ticket.id, itemId, status)
  }

  // Determinar si el ticket está urgente
  const isUrgent = elapsedMinutes > 15 || ticket.priority === 'HIGH'

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`
        kds-card relative overflow-hidden
        ${isUrgent ? 'ring-2 ring-red-500 ring-opacity-50' : ''}
      `}
    >
      {/* Header del ticket */}
      <KdsTicketHeader
        ticket={ticket}
        elapsedMinutes={elapsedMinutes}
        timerColor={getTimerColor()}
      />

      {/* Barra de progreso */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-xs text-kds-secondary mb-1">
          <span>Progreso</span>
          <span>{completedItems}/{totalItems} items</span>
        </div>
        <div className="w-full bg-kds-border rounded-full h-2">
          <motion.div
            className="bg-green-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Items del ticket */}
      <div className="px-4 pb-4 max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {ticket.items.map((item, index) => (
            <KdsTicketItem
              key={item.id}
              item={item}
              index={index}
              onStatusChange={handleItemStatusChange}
            />
          ))}
        </div>
      </div>

      {/* Acciones del ticket */}
      <KdsTicketActions
        ticket={ticket}
        completedItems={completedItems}
        totalItems={totalItems}
      />

      {/* Indicador de urgencia */}
      {isUrgent && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
        >
          <AlertTriangle className="w-4 h-4" />
        </motion.div>
      )}
    </motion.div>
  )
}
