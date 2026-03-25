import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Clock, Check, ArrowRight, RotateCcw, Plus, Wifi, WifiOff, AlertTriangle, Store, Utensils, Truck, Home } from 'lucide-react'
import { useKdsStore, KdsTicket, KdsTicketStatus } from './stores/useKdsStore'

function Timer({ createdAt, completedAt, deletedAt }: { createdAt: Date; completedAt?: Date; deletedAt?: Date }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    // Timer detenido si está completado o eliminado
    if (completedAt) {
      setElapsed(Math.floor((new Date(completedAt).getTime() - new Date(createdAt).getTime()) / 1000))
      return
    }
    if (deletedAt) {
      setElapsed(Math.floor((new Date(deletedAt).getTime() - new Date(createdAt).getTime()) / 1000))
      return
    }
    // Timer activo
    const update = () => setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [createdAt, completedAt, deletedAt])
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const isStopped = completedAt || deletedAt
  const color = isStopped ? 'text-gray-400' : mins >= 15 ? 'text-red-500' : mins >= 10 ? 'text-amber-500' : 'text-gray-500'
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
  const { tickets, stationId, setStationId, bumpTicket, recallTicket, deleteTicket, permanentDeleteTicket, loadTickets } = useKdsStore()
  const [filter, setFilter] = useState<'active' | 'history' | KdsTicketStatus>('active')
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today')

  // Load tickets from API on station select
  useEffect(() => {
    if (stationId) {
      loadTickets()
      // Reload tickets every 5 seconds for real-time sync
      const interval = setInterval(loadTickets, 5000)
      return () => clearInterval(interval)
    }
  }, [stationId, loadTickets])

  // Filtrado por fecha
  const filterByDate = (ticket: KdsTicket) => {
    const ticketDate = new Date(ticket.createdAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (dateFilter === 'today') {
      return ticketDate >= today
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return ticketDate >= yesterday && ticketDate < today
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return ticketDate >= weekAgo
    }
    return true // 'all'
  }

  const dateFiltered = tickets.filter(filterByDate)
  
  // Filtrado mejorado: Activos vs Historial
  const filtered = filter === 'active' 
    ? dateFiltered.filter(t => !t.deletedAt && t.status !== 'SERVED' && t.status !== 'CANCELLED')
    : filter === 'history'
    ? dateFiltered.filter(t => t.deletedAt || t.status === 'SERVED' || t.status === 'CANCELLED')
    : dateFiltered.filter(t => !t.deletedAt && t.status === filter)
  
  const counts = { 
    NEW: dateFiltered.filter(t => !t.deletedAt && t.status === 'NEW').length, 
    PREPARING: dateFiltered.filter(t => !t.deletedAt && t.status === 'PREPARING').length, 
    READY: dateFiltered.filter(t => !t.deletedAt && t.status === 'READY').length,
    ACTIVE: dateFiltered.filter(t => !t.deletedAt && t.status !== 'SERVED' && t.status !== 'CANCELLED').length,
    HISTORY: dateFiltered.filter(t => t.deletedAt || t.status === 'SERVED' || t.status === 'CANCELLED').length
  }

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
          <h3 className="font-semibold text-gray-700 mb-4">Selecciona Estación</h3>
          <div className="space-y-3">
            {[
              { id: 'COCINA_PRINCIPAL', name: 'Cocina Principal', desc: 'Línea caliente - Comidas' }, 
              { id: 'COCINA_FRIA', name: 'Cocina Fría', desc: 'Ensaladas y postres' }, 
              { id: 'BAR', name: 'Bar', desc: 'Bebidas y cócteles' }, 
              { id: 'PARRILLA', name: 'Parrilla', desc: 'Carnes y asados' },
              { id: 'POSTRES', name: 'Postres', desc: 'Repostería y dulces' },
              { id: 'ENSALADAS', name: 'Ensaladas', desc: 'Ensaladas y vegetales' }
            ].map(s => (
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
            <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full font-bold">{counts.ACTIVE} Activos</span>
            <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full font-bold">{counts.HISTORY} Historial</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400"><Wifi className="w-4 h-4" /><span className="text-xs">Online</span></div>
          <button onClick={() => { useKdsStore.setState({ stationId: null, tickets: [] }) }} className="text-xs text-gray-400 hover:text-white">Salir</button>
        </div>
      </header>

      {/* Filter bar */}
      <div className="bg-gray-800/50 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex gap-2">
          <button onClick={() => setFilter('active')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'active' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
            🔥 Activos ({counts.ACTIVE})
          </button>
          {(['NEW', 'PREPARING', 'READY'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
              {statusLabels[f]}
            </button>
          ))}
          <button onClick={() => setFilter('history')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'history' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
            📋 Historial ({counts.HISTORY})
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400">Fecha:</span>
          {(['today', 'yesterday', 'week', 'all'] as const).map(d => (
            <button key={d} onClick={() => setDateFilter(d)} className={`px-2 py-1 rounded text-xs font-medium transition-all ${dateFilter === d ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
              {d === 'today' ? 'Hoy' : d === 'yesterday' ? 'Ayer' : d === 'week' ? 'Semana' : 'Todo'}
            </button>
          ))}
        </div>
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
                      <Timer createdAt={ticket.createdAt} completedAt={ticket.completedAt} deletedAt={ticket.deletedAt} />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${statusBadge[ticket.status]}`}>{statusLabels[ticket.status]}</span>
                    </div>
                  </div>
                  {/* Order type & info */}
                  <div className="px-4 py-2 flex justify-between items-center text-xs border-b border-gray-200/50">
                    <div className="flex items-center gap-2">
                      {ticket.tipo === 'MESA' && (
                        <>
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                            <Utensils className="w-3 h-3" /> MESA {ticket.table}
                          </span>
                        </>
                      )}
                      {ticket.tipo === 'DOMICILIO' && (
                        <>
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                            <Truck className="w-3 h-3" /> DOMICILIO
                          </span>
                        </>
                      )}
                      {ticket.tipo === 'LLEVAR' && (
                        <>
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                            <Home className="w-3 h-3" /> LLEVAR
                          </span>
                        </>
                      )}
                      {!ticket.tipo && ticket.table && (
                        <span className="font-medium">{ticket.table}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      {ticket.cliente && <span className="font-medium text-gray-700">{ticket.cliente}</span>}
                      {ticket.telefono && <span className="text-gray-500">{ticket.telefono}</span>}
                      {!ticket.cliente && ticket.waiter && <span className="text-gray-500">{ticket.waiter}</span>}
                    </div>
                  </div>
                  {/* Completion time */}
                  {ticket.completedAt && (
                    <div className="px-4 py-1 bg-gray-100 text-xs text-gray-600 border-b border-gray-200/50">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Entregado: {new Date(ticket.completedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  {/* Items */}
                  <div className="px-4 py-3 space-y-3">
                    {ticket.items.map(item => (
                      <div key={item.id} className={`flex items-start gap-3 py-1.5 ${item.status === 'READY' ? 'opacity-50 line-through' : ''}`}>
                        {item.image && (
                          <div className="flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{item.quantity}x</span>
                            <span className="text-sm text-gray-800 truncate">{item.name}</span>
                          </div>
                          {item.notes && <p className="text-xs text-orange-600 font-medium mt-0.5">{item.notes}</p>}
                        </div>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${item.status === 'PENDING' ? 'bg-gray-200 text-gray-600' : item.status === 'PREPARING' ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'}`}>
                          {item.status === 'PENDING' ? 'Pend' : item.status === 'PREPARING' ? 'Prep' : 'OK'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Action buttons */}
                  <div className="px-4 py-3 border-t border-gray-200/50">
                    {filter === 'history' ? (
                      <div className="flex gap-2">
                        {ticket.deletedAt ? (
                          <button onClick={() => permanentDeleteTicket(ticket.id)} className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-red-600 text-white hover:bg-red-700" title="Eliminar permanentemente">
                            🗑️ Eliminar Definitivo
                          </button>
                        ) : (
                          <div className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-gray-200 text-gray-600 text-center">
                            ✓ Completado
                          </div>
                        )}
                      </div>
                    ) : ticket.status !== 'SERVED' ? (
                      <div className="flex gap-2">
                        <button onClick={() => bumpTicket(ticket.id)} className={`flex-1 py-2.5 rounded-lg font-bold text-sm text-white transition-all active:scale-95 ${ticket.status === 'NEW' ? 'bg-amber-500 hover:bg-amber-600' : ticket.status === 'PREPARING' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                          {ticket.status === 'NEW' ? '▶ Iniciar' : ticket.status === 'PREPARING' ? '✓ Listo' : '🚀 Despachar'}
                        </button>
                        <button onClick={() => deleteTicket(ticket.id)} className="px-3 py-2.5 rounded-lg font-bold text-sm bg-red-500 text-white hover:bg-red-600" title="Cancelar orden">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => recallTicket(ticket.id)} className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center gap-2">
                          <RotateCcw className="w-4 h-4" /> Reabrir
                        </button>
                      </div>
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
