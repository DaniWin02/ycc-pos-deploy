import React from 'react'
import { useParams } from 'react-router-dom'
import { KdsHeader } from './KdsHeader'
import { KdsTicketGrid } from './KdsTicketGrid'
import { useKdsStore } from '../stores/useKdsStore'

export function KdsApp() {
  const { stationId } = useParams<{ stationId: string }>()
  const { tickets, connectionStatus } = useKdsStore()

  // Filtrar tickets por estación
  const stationTickets = tickets.filter(ticket => 
    ticket.stationId === stationId || ticket.items.some(item => item.stationId === stationId)
  )

  // Tickets pendientes (no completados)
  const pendingTickets = stationTickets.filter(ticket => 
    ticket.status !== 'COMPLETED' && ticket.status !== 'CANCELLED'
  )

  return (
    <div className="min-h-screen bg-kds-bg">
      {/* Header */}
      <KdsHeader 
        stationId={stationId || ''}
        pendingCount={pendingTickets.length}
        connectionStatus={connectionStatus}
      />

      {/* Grid de tickets */}
      <div className="p-4">
        <KdsTicketGrid tickets={pendingTickets} />
      </div>
    </div>
  )
}
