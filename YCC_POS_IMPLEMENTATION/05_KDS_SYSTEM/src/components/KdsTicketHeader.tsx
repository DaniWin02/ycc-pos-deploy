import React from 'react'
import { Clock, Hash, User } from 'lucide-react'
import type { KdsTicket as KdsTicketType } from '@ycc/types'

interface KdsTicketHeaderProps {
  ticket: KdsTicketType
  elapsedMinutes: number
  timerColor: string
}

export function KdsTicketHeader({ ticket, elapsedMinutes, timerColor }: KdsTicketHeaderProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-500 bg-red-500/10'
      case 'NORMAL': return 'text-yellow-500 bg-yellow-500/10'
      case 'LOW': return 'text-green-500 bg-green-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  return (
    <div className="bg-kds-header px-4 py-3 border-b border-kds-border">
      <div className="flex items-center justify-between">
        {/* Folio y tipo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-kds-text" />
            <span className="font-bold text-kds-text">
              {ticket.folio}
            </span>
          </div>
          
          <div className="text-sm text-kds-secondary">
            {ticket.customerName ? (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{ticket.customerName}</span>
              </div>
            ) : (
              <span>Mesa {ticket.tableNumber || 'N/A'}</span>
            )}
          </div>
        </div>

        {/* Timer y prioridad */}
        <div className="flex items-center space-x-3">
          {/* Prioridad */}
          <div className={`
            px-2 py-1 rounded text-xs font-medium
            ${getPriorityColor(ticket.priority)}
          `}>
            {ticket.priority}
          </div>

          {/* Timer */}
          <div className="flex items-center space-x-2">
            <Clock className={`w-4 h-4 ${timerColor}`} />
            <span className={`font-mono font-bold ${timerColor}`}>
              {formatTime(elapsedMinutes)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
