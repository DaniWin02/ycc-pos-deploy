import React from 'react'
import { motion } from 'framer-motion'
import { Eye, CheckCircle, Clock } from 'lucide-react'
import type { KdsTicket as KdsTicketType } from '@ycc/types'
import { useKdsStore } from '../stores/useKdsStore'
import { KdsTicket } from './KdsTicket'

export function KdsExpediter() {
  const { tickets } = useKdsStore()

  // Filtrar tickets para vista de expediter (todos los tickets activos)
  const activeTickets = tickets.filter(ticket => 
    ticket.status !== 'COMPLETED' && ticket.status !== 'CANCELLED'
  )

  // Agrupar tickets por estación
  const ticketsByStation = activeTickets.reduce((acc, ticket) => {
    const station = ticket.stationId || 'general'
    if (!acc[station]) {
      acc[station] = []
    }
    acc[station].push(ticket)
    return acc
  }, {} as Record<string, KdsTicketType[]>)

  const stationNames: Record<string, string> = {
    kitchen: 'Cocina',
    bar: 'Bar',
    grill: 'Parrilla',
    dessert: 'Postres',
    general: 'General'
  }

  const getStationColor = (stationId: string) => {
    const colors: Record<string, string> = {
      kitchen: 'border-blue-500',
      bar: 'border-purple-500',
      grill: 'border-orange-500',
      dessert: 'border-pink-500',
      general: 'border-gray-500'
    }
    return colors[stationId] || 'border-gray-500'
  }

  const handleBumpTicket = (ticketId: string) => {
    // Emitir evento para marcar ticket como completado en expediter
    const { socket } = useKdsStore.getState()
    if (socket) {
      socket.emit('expediter:bump-ticket', { ticketId })
    }
  }

  return (
    <div className="min-h-screen bg-kds-bg p-4">
      {/* Header */}
      <div className="bg-kds-header border-b border-kds-border px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-kds-text" />
            <h1 className="text-2xl font-bold text-kds-text">
              Vista de Expediter
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-kds-text">
                {activeTickets.length}
              </div>
              <div className="text-sm text-kds-secondary">
                Tickets Activos
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {activeTickets.filter(t => t.items.every(i => i.status === 'READY')).length}
              </div>
              <div className="text-sm text-kds-secondary">
                Listos para Entregar
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de estaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(ticketsByStation).map(([stationId, stationTickets]) => (
          <motion.div
            key={stationId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`
              kds-card border-l-4 ${getStationColor(stationId)}
            `}
          >
            {/* Header de estación */}
            <div className="bg-kds-header px-4 py-3 border-b border-kds-border">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-kds-text">
                  {stationNames[stationId] || stationId}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-kds-secondary">
                    {stationTickets.length} tickets
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Tickets de la estación */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {stationTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="relative"
                >
                  {/* Miniatura del ticket */}
                  <div className="bg-kds-card border border-kds-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-kds-text">
                          #{ticket.folio}
                        </span>
                        <span className="text-sm text-kds-secondary">
                          Mesa {ticket.tableNumber || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Timer simplificado */}
                        <div className="flex items-center space-x-1 text-sm">
                          <Clock className="w-3 h-3 text-kds-secondary" />
                          <span className="text-kds-secondary">
                            {Math.floor((new Date().getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60))}m
                          </span>
                        </div>
                        
                        {/* Estado de preparación */}
                        <div className="flex items-center space-x-1">
                          {ticket.items.every(item => item.status === 'READY') ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-yellow-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items resumidos */}
                    <div className="text-sm text-kds-secondary">
                      {ticket.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>

                    {/* Botón de bump si está listo */}
                    {ticket.items.every(item => item.status === 'READY') && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBumpTicket(ticket.id)}
                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium"
                      >
                        Marcar como Entregado
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Mensaje si no hay tickets */}
              {stationTickets.length === 0 && (
                <div className="text-center py-8 text-kds-secondary">
                  <div className="text-3xl mb-2">📋</div>
                  <p>No hay tickets en esta estación</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mensaje si no hay tickets activos */}
      {activeTickets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🍽</div>
          <h3 className="text-xl font-semibold text-kds-text mb-2">
            No hay tickets activos
          </h3>
          <p className="text-kds-secondary">
            Los tickets aparecerán aquí cuando se creen nuevas órdenes
          </p>
        </motion.div>
      )}
    </div>
  )
}
