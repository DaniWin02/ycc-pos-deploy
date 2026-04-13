import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Clock, Check, ArrowRight, RotateCcw, Plus, Wifi, WifiOff, AlertTriangle, Store, Utensils, Truck, Home, User, Delete } from 'lucide-react'
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

interface Station {
  id: string;
  name: string;
  displayName: string;
  color?: string;
  isActive: boolean;
}

interface KdsUser {
  id: string;
  name: string;
  role: string;
}

// PIN Pad Component
function PinPad({ onLogin }: { onLogin: (user: KdsUser) => void }) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Usuarios del sistema KDS
  const users = [
    { id: 'chef1', name: 'Chef Principal', pin: '1234', role: 'chef' },
    { id: 'cocina1', name: 'Cocinero 1', pin: '1111', role: 'chef' },
    { id: 'bar1', name: 'Barman', pin: '2222', role: 'bartender' },
    { id: 'admin1', name: 'Administrador', pin: '9999', role: 'admin' }
  ]

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit)
      setError('')
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
    setError('')
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  const handleLogin = () => {
    if (pin.length !== 4) {
      setError('Ingresa 4 dígitos')
      return
    }

    setLoading(true)
    setError('')

    const user = users.find(u => u.pin === pin)
    
    if (user) {
      console.log('✅ Login exitoso:', user.name)
      onLogin({ id: user.id, name: user.name, role: user.role })
    } else {
      setError('PIN incorrecto')
      setPin('')
    }

    setLoading(false)
  }

  // Auto-login cuando el PIN tiene 4 dígitos
  useEffect(() => {
    if (pin.length === 4) {
      handleLogin()
    }
  }, [pin])

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-orange-800 via-orange-700 to-amber-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ChefHat className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Kitchen Display</h1>
          <p className="text-sm text-gray-500">YCC Country Club</p>
        </div>

        {/* PIN Display */}
        <div className="text-center mb-6">
          <User className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <h2 className="text-lg font-semibold text-gray-800">Ingresa tu PIN</h2>
          
          {/* PIN Dots */}
          <div className="flex justify-center gap-3 mt-4 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  i < pin.length ? 'bg-orange-600 scale-110' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-center text-sm font-medium">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-1">Verificando...</p>
            </div>
          )}
        </div>

        {/* PIN Pad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handlePinPress(digit)}
              disabled={loading}
              className="h-16 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold text-gray-800 transition-colors active:bg-orange-100"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            disabled={loading || pin.length === 0}
            className="h-16 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-semibold text-gray-700 disabled:opacity-50"
          >
            Borrar
          </button>
          <button
            onClick={() => handlePinPress('0')}
            disabled={loading}
            className="h-16 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl font-bold text-gray-800 transition-colors active:bg-orange-100"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="h-16 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
          >
            <Delete className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            PINs: 1234, 1111, 2222, 9999
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function App() {
  const { tickets, stationId, setStationId, bumpTicket, recallTicket, deleteTicket, permanentDeleteTicket, loadTickets, updateItemStatus } = useKdsStore()
  const [filter, setFilter] = useState<'active' | 'history' | KdsTicketStatus>('active')
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today')
  const [stations, setStations] = useState<Station[]>([])
  const [loadingStations, setLoadingStations] = useState(true)
  const [user, setUser] = useState<KdsUser | null>(null)
  
  // Search inputs for mobile
  const [stationSearch, setStationSearch] = useState('')
  const [ticketSearch, setTicketSearch] = useState('')

  // Window size tracking for responsive adjustments
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // Initial call
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Dynamic grid columns based on window width
  const getGridCols = () => {
    const width = windowSize.width
    if (width >= 1536) return 'grid-cols-5' // 2xl
    if (width >= 1280) return 'grid-cols-4' // xl
    if (width >= 1024) return 'grid-cols-3' // lg
    if (width >= 640) return 'grid-cols-2'   // sm
    return 'grid-cols-1' // mobile
  }

  // Dynamic ticket card height based on window height
  const getTicketCardClass = () => {
    const height = windowSize.height
    if (height <= 600) return 'max-h-[calc(100vh-200px)]'
    if (height <= 800) return 'max-h-[calc(100vh-220px)]'
    return 'max-h-[calc(100vh-240px)]'
  }

  // Cargar estaciones desde API
  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await fetch('http://localhost:3004/api/stations')
        if (response.ok) {
          const data = await response.json()
          setStations(data.filter((s: Station) => s.isActive))
        }
      } catch (error) {
        console.error('Error cargando estaciones:', error)
      } finally {
        setLoadingStations(false)
      }
    }
    loadStations()
  }, [])

  // Load tickets from API on station select
  useEffect(() => {
    if (stationId) {
      loadTickets()
      // Reload tickets every 5 seconds for real-time sync
      const interval = setInterval(loadTickets, 5000)
      return () => clearInterval(interval)
    }
  }, [stationId, loadTickets])

  // Filtrar estaciones por búsqueda
  const filteredStations = stations.filter(s => 
    stationSearch === '' || 
    s.displayName.toLowerCase().includes(stationSearch.toLowerCase()) ||
    s.name.toLowerCase().includes(stationSearch.toLowerCase())
  )

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
  
  // Filtrar tickets por búsqueda (folio o cliente)
  const searchFilteredTickets = dateFiltered.filter(ticket => {
    if (ticketSearch === '') return true
    const search = ticketSearch.toLowerCase()
    return ticket.folio.toLowerCase().includes(search) ||
           (ticket.cliente && ticket.cliente.toLowerCase().includes(search)) ||
           (ticket.table && ticket.table.toLowerCase().includes(search))
  })
  
  // Filtrado mejorado: Activos vs Historial
  const filtered = filter === 'active' 
    ? searchFilteredTickets.filter(t => !t.deletedAt && t.status !== 'SERVED' && t.status !== 'CANCELLED')
    : filter === 'history'
    ? searchFilteredTickets.filter(t => t.deletedAt || t.status === 'SERVED' || t.status === 'CANCELLED')
    : searchFilteredTickets.filter(t => !t.deletedAt && t.status === filter)
  
  const counts = { 
    NEW: dateFiltered.filter(t => !t.deletedAt && t.status === 'NEW').length, 
    PREPARING: dateFiltered.filter(t => !t.deletedAt && t.status === 'PREPARING').length, 
    READY: dateFiltered.filter(t => !t.deletedAt && t.status === 'READY').length,
    ACTIVE: dateFiltered.filter(t => !t.deletedAt && t.status !== 'SERVED' && t.status !== 'CANCELLED').length,
    HISTORY: dateFiltered.filter(t => t.deletedAt || t.status === 'SERVED' || t.status === 'CANCELLED').length
  }

  // Station selector - Optimizado para que todo quepa en pantalla sin scroll
  if (!user) {
    return <PinPad onLogin={setUser} />
  }

  if (!stationId) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-orange-800 via-orange-700 to-amber-600 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md flex flex-col max-h-[95vh]"
        >
          <div className="text-center mb-3 sm:mb-4 flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Kitchen Display System</h1>
            <p className="text-gray-500 text-xs sm:text-sm">YCC Country Club</p>
            {user && (
              <p className="text-orange-600 text-xs mt-1 font-medium">
                👋 Hola, {user.name}
              </p>
            )}
          </div>
          
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <h3 className="font-semibold text-gray-700 text-sm">Selecciona Estación</h3>
            <button 
              onClick={() => setUser(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cambiar usuario
            </button>
          </div>
          
          {/* Search input for stations */}
          <div className="mb-2 flex-shrink-0">
            <div className="relative">
              <input 
                type="text" 
                value={stationSearch}
                onChange={(e) => setStationSearch(e.target.value)}
                placeholder="Buscar estación..."
                className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white h-10"
              />
            </div>
          </div>
          
          {loadingStations ? (
            <div className="text-center py-4 text-gray-500 text-sm flex-shrink-0">Cargando estaciones...</div>
          ) : filteredStations.length === 0 ? (
            <div className="text-center py-4 text-red-500 text-sm flex-shrink-0">
              {stationSearch ? 'No se encontraron estaciones' : 'No hay estaciones disponibles'}
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
              {filteredStations.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setStationId(s.id)} 
                  className="w-full p-2.5 sm:p-3 rounded-lg border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-left transition-all flex items-center justify-between group flex-shrink-0"
                  style={{ borderLeftWidth: '4px', borderLeftColor: s.color || '#6B7280' }}
                >
                  <div>
                    <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      {s.displayName}
                      {s.color && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Estación de cocina</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // Main KDS view
  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header - Altura responsiva */}
      <header className="bg-gray-800 border-b border-gray-700 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
          <h1 className="font-bold text-base sm:text-lg">KDS</h1>
          <span className="text-xs sm:text-sm text-gray-400 capitalize hidden sm:inline">{stationId?.replace('-', ' ')}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Status counts - Responsive, se ocultan en móvil pequeño */}
          <div className="hidden md:flex gap-2 text-xs">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-bold">{counts.NEW}</span>
            <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full font-bold">{counts.PREPARING}</span>
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-bold">{counts.READY}</span>
          </div>
          {/* En móvil solo mostrar contador activo */}
          <div className="flex md:hidden items-center gap-1 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full font-bold">
            🔥 {counts.ACTIVE}
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <Wifi className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Online</span>
          </div>
          <button 
            onClick={() => { useKdsStore.setState({ stationId: null, tickets: [] }) }} 
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700"
          >
            Cambiar Estación
          </button>
          <button 
            onClick={() => { setUser(null); useKdsStore.setState({ stationId: null, tickets: [] }) }} 
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-700"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Filter bar - Responsiva */}
      <div className="bg-gray-800/50 px-3 sm:px-4 py-2 border-b border-gray-700 flex-shrink-0">
        {/* Search input for tickets */}
        <div className="mb-2">
          <div className="relative w-full max-w-full sm:max-w-md">
            <input 
              type="text" 
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              placeholder="Buscar folio, cliente o mesa..."
              className="w-full px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px]"
            />
            {ticketSearch && (
              <button 
                onClick={() => setTicketSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex gap-2 flex-nowrap">
            <button onClick={() => setFilter('active')} className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'active' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
              🔥 Activos ({counts.ACTIVE})
            </button>
            {(['NEW', 'PREPARING', 'READY'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {statusLabels[f]}
              </button>
            ))}
            <button onClick={() => setFilter('history')} className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'history' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
              📋 Hist ({counts.HISTORY})
            </button>
          </div>
          <div className="flex gap-1 items-center flex-shrink-0">
            {(['today', 'yesterday', 'week', 'all'] as const).map(d => (
              <button key={d} onClick={() => setDateFilter(d)} className={`px-2 py-1 rounded text-xs font-medium transition-all whitespace-nowrap ${dateFilter === d ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {d === 'today' ? 'Hoy' : d === 'yesterday' ? 'Ayer' : d === 'week' ? 'Sem' : 'Todo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets grid - Layout dinámico basado en tamaño de ventana */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 mb-4 opacity-20" />
            <p className="text-base sm:text-lg">No hay ordenes pendientes</p>
          </div>
        ) : (
          <div className={`grid ${getGridCols()} gap-2 sm:gap-4`}>
            <AnimatePresence>
              {filtered.map(ticket => (
                <motion.div 
                  key={ticket.id} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }} 
                  layout 
                  className={`rounded-xl border-2 overflow-hidden ${statusColors[ticket.status]} flex flex-col ${getTicketCardClass()}`}
                >
                  {/* Ticket header - Responsivo */}
                  <div className={`px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between ${ticket.priority === 'rush' ? 'bg-red-500 text-white' : 'bg-white/80'}`}>
                    <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                      <span className="font-bold text-base sm:text-lg truncate">{ticket.folio}</span>
                      {ticket.priority === 'rush' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <Timer createdAt={ticket.createdAt} completedAt={ticket.completedAt} deletedAt={ticket.deletedAt} />
                      <span className={`text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full text-white ${statusBadge[ticket.status]}`}>{statusLabels[ticket.status]}</span>
                    </div>
                  </div>
                  {/* Order type & info - Responsivo */}
                  <div className="px-3 sm:px-4 py-2 flex flex-col sm:flex-row justify-between gap-2 text-xs border-b border-gray-200/50">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ticket.tipo === 'MESA' && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                          <Utensils className="w-3 h-3" /> MESA {ticket.table}
                        </span>
                      )}
                      {ticket.tipo === 'DOMICILIO' && (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                          <Truck className="w-3 h-3" /> DOMICILIO
                        </span>
                      )}
                      {ticket.tipo === 'LLEVAR' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                          <Home className="w-3 h-3" /> LLEVAR
                        </span>
                      )}
                      {!ticket.tipo && ticket.table && (
                        <span className="font-medium">{ticket.table}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-start sm:items-end text-xs">
                      {ticket.cliente && <span className="font-medium text-gray-700 truncate max-w-[150px]">{ticket.cliente}</span>}
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
                  {/* Items - Responsivo y CLICKEABLES para subrayar individualmente */}
                  <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3 flex-1">
                    {ticket.items.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          // Ciclar estado del item: PENDING → PREPARING → READY → PENDING
                          if (ticket.status !== 'SERVED' && ticket.status !== 'CANCELLED') {
                            const nextStatus = item.status === 'PENDING' ? 'PREPARING' : item.status === 'PREPARING' ? 'READY' : 'PENDING';
                            updateItemStatus(ticket.id, item.id, nextStatus);
                          }
                        }}
                        className={`flex items-start gap-2 sm:gap-3 py-1 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-all ${
                          item.status === 'READY' ? 'opacity-60 line-through decoration-2 decoration-emerald-500' : ''
                        }`}
                      >
                        {item.image && (
                          <div className="flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-200"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="font-bold text-sm text-gray-900">{item.quantity}x</span>
                            <span className="text-sm text-gray-800 truncate">{item.name}</span>
                          </div>
                          {item.notes && <p className="text-xs text-orange-600 font-medium mt-0.5">{item.notes}</p>}
                        </div>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                          item.status === 'PENDING' ? 'bg-gray-200 text-gray-600' : 
                          item.status === 'PREPARING' ? 'bg-amber-200 text-amber-800' : 
                          'bg-emerald-200 text-emerald-800'
                        }`}>
                          {item.status === 'PENDING' ? 'Pend' : item.status === 'PREPARING' ? 'Prep' : 'OK'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Action buttons - Responsivo */}
                  <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200/50 mt-auto">
                    {filter === 'history' ? (
                      <div className="flex gap-2">
                        {ticket.deletedAt ? (
                          <button onClick={() => permanentDeleteTicket(ticket.id)} className="flex-1 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-red-600 text-white hover:bg-red-700 touch-target" title="Eliminar permanentemente">
                            🗑️ Eliminar
                          </button>
                        ) : (
                          <div className="flex-1 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-gray-200 text-gray-600 text-center">
                            ✓ Completado
                          </div>
                        )}
                      </div>
                    ) : ticket.status !== 'SERVED' ? (
                      <div className="flex gap-2">
                        {/* SOLO mostrar botón de despacho cuando todos los items estén READY */}
                        {ticket.items.every(i => i.status === 'READY') ? (
                          <button 
                            onClick={() => bumpTicket(ticket.id)} 
                            className="flex-1 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm text-white transition-all active:scale-95 touch-target bg-blue-500 hover:bg-blue-600"
                          >
                            🚀 Despachar
                          </button>
                        ) : (
                          <div className="flex-1 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-gray-100 text-gray-500 text-center">
                            👆 Click en items para marcar listos
                          </div>
                        )}
                        <button onClick={() => deleteTicket(ticket.id)} className="px-3 py-2 sm:py-2.5 rounded-lg font-bold text-sm bg-red-500 text-white hover:bg-red-600 touch-target" title="Cancelar orden">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => recallTicket(ticket.id)} className="flex-1 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center gap-2 touch-target">
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
