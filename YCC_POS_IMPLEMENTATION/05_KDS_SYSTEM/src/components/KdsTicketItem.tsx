import React from 'react'
import { motion } from 'framer-motion'
import { Check, Clock, Play } from 'lucide-react'
import type { KdsItem as KdsItemType, KdsItemStatus } from '@ycc/types'

interface KdsTicketItemProps {
  item: KdsItemType
  index: number
  onStatusChange: (itemId: string, status: KdsItemStatus) => void
}

export function KdsTicketItem({ item, index, onStatusChange }: KdsTicketItemProps) {
  // Determinar color y estado visual
  const getStatusColor = (status: KdsItemStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'PREPARING': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'READY': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: KdsItemStatus) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'PREPARING': return <Play className="w-4 h-4" />
      case 'READY': return <Check className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const handleStatusClick = () => {
    let nextStatus: KdsItemStatus
    
    switch (item.status) {
      case 'PENDING':
        nextStatus = 'PREPARING'
        break
      case 'PREPARING':
        nextStatus = 'READY'
        break
      case 'READY':
        nextStatus = 'PENDING' // Permitir regresar a pendiente
        break
      default:
        nextStatus = 'PREPARING'
    }
    
    onStatusChange(item.id, nextStatus)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer
        transition-all duration-200 hover:scale-102
        ${getStatusColor(item.status)}
        ${item.status === 'READY' ? 'animate-pulse-green' : ''}
      `}
      onClick={handleStatusClick}
    >
      {/* Información del item */}
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            {item.quantity}x {item.name}
          </span>
          
          {/* Indicador de modificadores */}
          {item.modifiers && item.modifiers.length > 0 && (
            <span className="text-xs bg-black/10 px-2 py-1 rounded-full">
              +{item.modifiers.length}
            </span>
          )}
        </div>
        
        {/* Modificadores */}
        {item.modifiers && item.modifiers.length > 0 && (
          <div className="text-xs mt-1 space-y-1">
            {item.modifiers.map((modifier, idx) => (
              <div key={idx} className="text-black/60">
                • {modifier.name}
                {modifier.quantity > 1 && ` x${modifier.quantity}`}
              </div>
            ))}
          </div>
        )}
        
        {/* Notas */}
        {item.notes && (
          <div className="text-xs mt-1 italic text-black/60">
            Nota: {item.notes}
          </div>
        )}
      </div>

      {/* Estado y acciones */}
      <div className="flex items-center space-x-2">
        {/* Estado */}
        <div className="flex items-center space-x-1">
          {getStatusIcon(item.status)}
          <span className="text-xs font-medium uppercase">
            {item.status}
          </span>
        </div>
        
        {/* Tiempo estimado */}
        {item.estimatedTime && (
          <div className="text-xs text-black/60">
            {item.estimatedTime}min
          </div>
        )}
      </div>
    </motion.div>
  )
}
