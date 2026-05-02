import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { KdsTicket as KdsTicketType } from '@ycc/types'
import { KdsTicket } from './KdsTicket'

interface KdsTicketGridProps {
  tickets: KdsTicketType[]
}

export function KdsTicketGrid({ tickets }: KdsTicketGridProps) {
  // Ordenar tickets por prioridad y tiempo
  const sortedTickets = tickets.sort((a, b) => {
    // Primero por prioridad
    const priorityOrder = { HIGH: 0, NORMAL: 1, LOW: 2 }
    const priorityDiff =
      priorityOrder[(a.priority === 'normal' || a.priority === 'rush' ? 'NORMAL' : a.priority) as 'HIGH' | 'NORMAL' | 'LOW'] -
      priorityOrder[(b.priority === 'normal' || b.priority === 'rush' ? 'NORMAL' : b.priority) as 'HIGH' | 'NORMAL' | 'LOW']
    
    if (priorityDiff !== 0) return priorityDiff
    
    // Luego por tiempo de creación
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence>
        {sortedTickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ 
              opacity: 0, 
              x: 300,
              scale: 0.8
            }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              x: -300,
              scale: 0.8
            }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.1,
              ease: "easeOut"
            }}
            layout
          >
            <KdsTicket ticket={ticket} />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Mensaje cuando no hay tickets */}
      {tickets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full text-center py-16"
        >
          <div className="text-kds-secondary">
            <div className="text-6xl mb-4">🍽</div>
            <h3 className="text-xl font-semibold mb-2">
              No hay órdenes pendientes
            </h3>
            <p>
              Las nuevas órdenes aparecerán aquí automáticamente
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
