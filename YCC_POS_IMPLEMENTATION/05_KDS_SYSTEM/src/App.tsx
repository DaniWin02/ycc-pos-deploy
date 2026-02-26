import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Clock, Check, ArrowRight, RotateCcw, Plus, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import { useKdsStore, KdsTicket, KdsTicketStatus } from './stores/useKdsStore'

// Mock tickets for demo
const MOCK_TICKETS: KdsTicket[] = [
  { id: '1', folio: 'V-0001', table: 'Mesa 5', waiter: 'Carlos', priority: 'normal', status: 'NEW', createdAt: new Date(Date.now() - 3 * 60000), items: [
    { id: '1a', name: 'Hamburguesa Clasica', quantity: 2, status: 'PENDING' },
    { id: '1b', name: 'Papas Fritas', quantity: 2, status: 'PENDING' },
    { id: '1c', name: 'Coca Cola 600ml', quantity: 2, notes: 'Sin hielo', status: 'PENDING' },
  ]},
  { id: '2', folio: 'V-0002', table: 'Mesa 12', waiter: 'Ana', priority: 'rush', status: 'NEW', createdAt: new Date(Date.now() - 8 * 60000), items: [
    { id: '2a', name: 'Filete de Salmon', quantity: 1, notes: 'Termino medio', status: 'PENDING' },
    { id: '2b', name: 'Ensalada Cesar', quantity: 1, status: 'PENDING' },
  ]},
  { id: '3', folio: 'V-0003', table: 'Barra 3', waiter: 'Luis', priority: 'normal', status: 'PREPARING', createdAt: new Date(Date.now() - 12 * 60000), items: [
    { id: '3a', name: 'Tacos de Arrachera (3)', quantity: 1, status: 'PREPARING' },
    { id: '3b', name: 'Nachos con Queso', quantity: 1, status: 'READY' },
    { id: '3c', name: 'Guacamole con Totopos', quantity: 1, status: 'PREPARING' },
  ]},
  { id: '4', folio: 'V-0004', table: 'Mesa 8', waiter: 'Carlos', priority: 'normal', status: 'PREPARING', createdAt: new Date(Date.now() - 5 * 60000), items: [
    { id: '4a', name: 'Pizza Margarita', quantity: 1, status: 'PREPARING' },
    { id: '4b', name: 'Alitas BBQ (12pz)', quantity: 1, status: 'PENDING' },
  ]},
  { id: '5', folio: 'V-0005', table: 'Mesa 2', waiter: 'Ana', priority: 'normal', status: 'READY', createdAt: new Date(Date.now() - 15 * 60000), items: [
    { id: '5a', name: 'Club Sandwich', quantity: 2, status: 'READY' },
    { id: '5b', name: 'Limonada Natural', quantity: 2, status: 'READY' },
  ]},
]

function Timer({ createdAt }: { createdAt: Date }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [createdAt])
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const color = mins >= 15 ? 'text-red-500' : mins >= 10 ? 'text-amber-500' : 'text-gray-500'
  return <span className={`font-mono text-sm font-bold ${color}`}>{mins}:{String(secs).padStart(2, '0')}</span>
}

const statusColors: Record<KdsTicketStatus, string> = {
  NEW: 'border-blue-400 bg-blue-50',
  PREPARING: 'border-amber-400 bg-amber-50',
  READY: 'border-emerald-400 bg-emerald-50',
  SERVED: 'border-gray-300 bg-gray-50',
  CANCELLED: 'border-red-300 bg-red-50',
}
const statusLabels: Record<KdsTicketStatus, string> = {
  NEW: 'Nuevo', PREPARING: 'Preparando', READY: 'Listo', SERVED: 'Servido', CANCELLED: 'Cancelado'
}
const statusBadge: Record<KdsTicketStatus, string> = {
  NEW: 'bg-blue-500', PREPARING: 'bg-amber-500', READY: 'bg-emerald-500', SERVED: 'bg-gray-400', CANCELLED: 'bg-red-500'
}

function App() {
  const { tickets, stationId, connectionStatus, setStationId, addTicket, bumpTicket, recallTicket } = useKdsStore()
  const [filter, setFilter] = useState<'all' | KdsTicketStatus>('all')

  // Load mock data on station select
  useEffect(() => {
    if (stationId && tickets.length === 0) {
      MOCK_TICKETS.forEach(t => addTicket(t))
    }
  }, [stationId])

  const filtered = filter === 'all' ? tickets.filter(t => t.status !== 'SERVED' && t.status !== 'CANCELLED') : tickets.filter(t => t.status === filter)
  const counts = { NEW: tickets.filter(t => t.status === 'NEW').length, PREPARING: tickets.filter(t => t.status === 'PREPARING').length, READY: tickets.filter(t => t.status === 'READY').length }

  // Station selector
  if (!stationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-800 via-orange-700 to-amber-600 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Kitchen Display System</h1>
            <p className="text-gray-500 mt-1">YCC Country Club</p>
          </div>
          <h3 className="font-semibold text-gray-700 mb-4">Selecciona Estacion</h3>
          <div className="space-y-3">
            {[{ id: 'cocina-1', name: 'Cocina Principal', desc: 'Linea caliente - Comidas' }, { id: 'cocina-2', name: 'Cocina Fria', desc: 'Ensaladas y postres' }, { id: 'barra', name: 'Barra', desc: 'Bebidas y cocktails' }, { id: 'expediter', name: 'Expediter', desc: 'Vista general - Despacho' }].map(s => (
              <button key={s.id} onClick={() => setStationId(s.id)} className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-left transition-all flex items-center justify-between group">
                <div><div className="font-semibold text-gray-900">{s.name}</div><div className="text-sm text-gray-500">{s.desc}</div></div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Main KDS view
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-orange-400" />
          <h1 className="font-bold text-lg">KDS</h1>
          <span className="text-sm text-gray-400 capitalize">{stationId?.replace('-', ' ')}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Status counts */}
          <div className="flex gap-2 text-xs">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-bold">{counts.NEW} Nuevos</span>
            <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full font-bold">{counts.PREPARING} Prep</span>
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-bold">{counts.READY} Listos</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400"><Wifi className="w-4 h-4" /><span className="text-xs">Online</span></div>
          <button onClick={() => { useKdsStore.setState({ stationId: null, tickets: [] }) }} className="text-xs text-gray-400 hover:text-white">Salir</button>
        </div>
      </header>

      {/* Filter bar */}
      <div className="bg-gray-800/50 px-4 py-2 flex gap-2 border-b border-gray-700">
        {(['all', 'NEW', 'PREPARING', 'READY'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
            {f === 'all' ? 'Activos' : statusLabels[f]}
          </button>
        ))}
      </div>

      {/* Tickets grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ChefHat className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">No hay ordenes pendientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map(ticket => (
                <motion.div key={ticket.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} layout className={`rounded-xl border-2 overflow-hidden ${statusColors[ticket.status]}`}>
                  {/* Ticket header */}
                  <div className={`px-4 py-3 flex items-center justify-between ${ticket.priority === 'rush' ? 'bg-red-500 text-white' : 'bg-white/80'}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{ticket.folio}</span>
                      {ticket.priority === 'rush' && <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer createdAt={ticket.createdAt} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${statusBadge[ticket.status]}`}>{statusLabels[ticket.status]}</span>
                    </div>
                  </div>
                  {/* Table & waiter */}
                  <div className="px-4 py-2 flex justify-between text-xs border-b border-gray-200/50">
                    <span className="font-medium">{ticket.table}</span>
                    <span className="text-gray-500">{ticket.waiter}</span>
                  </div>
                  {/* Items */}
                  <div className="px-4 py-3 space-y-2">
                    {ticket.items.map(item => (
                      <div key={item.id} className={`flex items-start justify-between py-1.5 ${item.status === 'READY' ? 'opacity-50 line-through' : ''}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{item.quantity}x</span>
                            <span className="text-sm text-gray-800">{item.name}</span>
                          </div>
                          {item.notes && <p className="text-xs text-orange-600 font-medium mt-0.5">{item.notes}</p>}
                        </div>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${item.status === 'PENDING' ? 'bg-gray-200 text-gray-600' : item.status === 'PREPARING' ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'}`}>
                          {item.status === 'PENDING' ? 'Pend' : item.status === 'PREPARING' ? 'Prep' : 'OK'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Bump button */}
                  <div className="px-4 py-3 border-t border-gray-200/50">
                    {ticket.status !== 'SERVED' ? (
                      <button onClick={() => bumpTicket(ticket.id)} className={`w-full py-2.5 rounded-lg font-bold text-sm text-white transition-all active:scale-95 ${ticket.status === 'NEW' ? 'bg-amber-500 hover:bg-amber-600' : ticket.status === 'PREPARING' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                        {ticket.status === 'NEW' ? 'Iniciar' : ticket.status === 'PREPARING' ? 'Listo' : 'Despachar'}
                      </button>
                    ) : (
                      <button onClick={() => recallTicket(ticket.id)} className="w-full py-2.5 rounded-lg font-bold text-sm bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Recall
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
