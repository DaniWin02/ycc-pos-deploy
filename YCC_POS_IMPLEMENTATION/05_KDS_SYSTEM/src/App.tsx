import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Clock, Check, ArrowRight, RotateCcw, Plus, Wifi, WifiOff, AlertTriangle, Store, Utensils, Truck, Home, User, Delete } from 'lucide-react'
import { useKdsStore, KdsTicket, KdsTicketStatus } from './stores/useKdsStore'

const displayFolio = (folio: string) => {
  if (!folio) return '#---'
  if (folio.includes('-')) {
    const num = folio.split('-')[1]
    return `#${num}`
  }
  return `#${folio}`
}

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
  return <span className={`font-mono text-sm md:text-base font-bold ${color}`}>{mins}:{String(secs).padStart(2, '0')}</span>
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
    <div className="h-screen w-screen bg-gradient-to-br from-orange-800 via-orange-700 to-amber-600 flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-sm md:max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <ChefHat className="w-8 h-8 md:w-10 md:h-10 text-orange-600" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Kitchen Display</h1>
          <p className="text-sm md:text-base text-gray-500">YCC Country Club</p>
        </div>

        {/* PIN Display */}
        <div className="text-center mb-6 md:mb-8">
          <User className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Ingresa tu PIN</h2>
          
          {/* PIN Dots */}
          <div className="flex justify-center gap-3 md:gap-4 mt-4 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full transition-all ${
                  i < pin.length ? 'bg-orange-600 scale-110' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-center text-sm md:text-base font-medium">
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

        {/* PIN Pad - Botones más grandes para tablet */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handlePinPress(digit)}
              disabled={loading}
              className="h-16 md:h-20 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl md:text-2xl font-bold text-gray-800 transition-colors active:bg-orange-100 min-h-[44px]"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            disabled={loading || pin.length === 0}
            className="h-16 md:h-20 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm md:text-base font-semibold text-gray-700 disabled:opacity-50 min-h-[44px]"
          >
            Borrar
          </button>
          <button
            onClick={() => handlePinPress('0')}
            disabled={loading}
            className="h-16 md:h-20 rounded-xl bg-gray-100 hover:bg-gray-200 text-xl md:text-2xl font-bold text-gray-800 transition-colors active:bg-orange-100 min-h-[44px]"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="h-16 md:h-20 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50 min-h-[44px]"
          >
            <Delete className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 md:mt-6">
          <p className="text-xs md:text-sm text-gray-400">
            PINs: 1234, 1111, 2222, 9999
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function App() {
  const { tickets, stationId, setStationId, bumpTicket, recallTicket, deleteTicket, permanentDeleteTicket, loadTickets, updateItemStatus, toggleItemMarked } = useKdsStore()
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

  // =============== DAILY AUTO-RESET ===============
  const KDS_RESET_KEY = 'kds_lastResetDate';
  const { checkAndClearForNewDay, forceClearAll } = useKdsStore();

  useEffect(() => {
    const checkDailyReset = () => {
      const today = new Date().toDateString();
      const lastReset = localStorage.getItem(KDS_RESET_KEY);
      const lastSessionDate = localStorage.getItem('kds-last-session-date');
      
      // Detectar cambio de día por cualquiera de las dos claves
      const isNewDay = lastReset !== today || (lastSessionDate && lastSessionDate !== new Date().toISOString().split('T')[0]);
      
      if (isNewDay) {
        console.log('🔄 KDS Reinicio diario - Limpiando sesión y tickets');
        // Usar función del store para limpiar correctamente
        forceClearAll();
        // Limpiar sesión
        setUser(null);
        localStorage.removeItem('kds-last-session-date');
        // Marcar reset de hoy
        localStorage.setItem(KDS_RESET_KEY, today);
        // Recargar página si hay cambio de día para asegurar estado limpio
        window.location.reload();
      }
    };

    // Verificar inmediatamente al cargar
    checkDailyReset();
    
    // Verificar cada minuto
    const interval = setInterval(checkDailyReset, 60000);
    
    // También verificar cuando la ventana recibe foco (usuario regresa)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ KDS visible - verificando nuevo día...');
        checkDailyReset();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [forceClearAll]);

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
  
  // Filtrar por estación: mostrar tickets que tengan al menos un item de la estación actual
  // Pero mostrar TODOS los items del ticket (no solo los de la estación)
  const stationFiltered = stationId 
    ? dateFiltered.filter(ticket => {
        const hasItem = ticket.items.some(item => item.stationId === stationId)
        if (!hasItem && ticket.items.length > 0) {
          console.log(`🚫 Ticket ${ticket.folio} filtrado - estación actual: ${stationId}, items stations: [${ticket.items.map(i => `${i.name}:${i.stationId}`).join(', ')}]`)
        }
        return hasItem
      })
    : dateFiltered
  
  // Filtrar tickets por búsqueda (folio o cliente)
  const searchFilteredTickets = stationFiltered.filter(ticket => {
    if (ticketSearch === '') return true
    const search = ticketSearch.toLowerCase()
    return displayFolio(ticket.folio).toLowerCase().includes(search) ||
           ticket.folio.toLowerCase().includes(search) ||
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
    NEW: stationFiltered.filter(t => !t.deletedAt && t.status === 'NEW').length, 
    PREPARING: stationFiltered.filter(t => !t.deletedAt && t.status === 'PREPARING').length, 
    READY: stationFiltered.filter(t => !t.deletedAt && t.status === 'READY').length,
    ACTIVE: stationFiltered.filter(t => !t.deletedAt && t.status !== 'SERVED' && t.status !== 'CANCELLED').length,
    HISTORY: stationFiltered.filter(t => t.deletedAt || t.status === 'SERVED' || t.status === 'CANCELLED').length
  }

  // Station selector - Optimizado para que todo quepa en pantalla sin scroll
  if (!user) {
    return <PinPad onLogin={setUser} />
  }

  if (!stationId) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-orange-800 via-orange-700 to-amber-600 flex items-center justify-center p-3 md:p-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-white rounded-xl shadow-2xl p-5 md:p-8 w-full max-w-sm md:max-w-md flex flex-col max-h-[95vh]"
        >
          <div className="text-center mb-4 md:mb-6 flex-shrink-0">
            <div className="w-14 h-14 md:w-18 md:h-18 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
              <ChefHat className="w-7 h-7 md:w-9 md:h-9 text-orange-600" />
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">Kitchen Display System</h1>
            <p className="text-gray-500 text-sm md:text-base">YCC Country Club</p>
            {user && (
              <p className="text-orange-600 text-sm md:text-base mt-1 font-medium">
                👋 Hola, {user.name}
              </p>
            )}
          </div>
          
          <div className="flex justify-between items-center mb-3 md:mb-4 flex-shrink-0">
            <h3 className="font-semibold text-gray-700 text-sm md:text-base">Selecciona Estación</h3>
            <button 
              onClick={() => setUser(null)}
              className="text-sm md:text-base text-gray-500 hover:text-gray-700 min-h-[44px] px-2"
            >
              Cambiar usuario
            </button>
          </div>
          
          {/* Search input for stations */}
          <div className="mb-3 md:mb-4 flex-shrink-0">
            <div className="relative">
              <input 
                type="text" 
                value={stationSearch}
                onChange={(e) => setStationSearch(e.target.value)}
                placeholder="Buscar estación..."
                className="w-full px-4 py-2.5 md:py-3 bg-gray-100 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white min-h-[44px]"
              />
            </div>
          </div>
          
          {loadingStations ? (
            <div className="text-center py-4 text-gray-500 text-sm md:text-base flex-shrink-0">Cargando estaciones...</div>
          ) : filteredStations.length === 0 ? (
            <div className="text-center py-4 text-red-500 text-sm md:text-base flex-shrink-0">
              {stationSearch ? 'No se encontraron estaciones' : 'No hay estaciones disponibles'}
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3 overflow-y-auto flex-1 min-h-0">
              {filteredStations.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setStationId(s.id)} 
                  className="w-full p-3 md:p-4 rounded-lg border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-left transition-all flex items-center justify-between group flex-shrink-0 min-h-[52px] md:min-h-[56px]"
                  style={{ borderLeftWidth: '4px', borderLeftColor: s.color || '#6B7280' }}
                >
                  <div>
                    <div className="font-semibold text-gray-900 text-sm md:text-base flex items-center gap-2">
                      {s.displayName}
                      {s.color && (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-orange-500 transition-colors" />
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
      {/* Header - Optimizado para tablet */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <ChefHat className="w-6 h-6 md:w-7 md:h-7 text-orange-400" />
          <h1 className="font-bold text-base md:text-lg">KDS</h1>
          <span className="text-sm md:text-base text-gray-400 capitalize hidden md:inline">{stationId?.replace('-', ' ')}</span>
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          {/* Status counts */}
          <div className="hidden md:flex gap-2 text-sm">
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full font-bold">{counts.NEW}</span>
            <span className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full font-bold">{counts.PREPARING}</span>
            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full font-bold">{counts.READY}</span>
          </div>
          {/* En móvil solo mostrar contador activo */}
          <div className="flex md:hidden items-center gap-1 text-sm bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full font-bold">
            🔥 {counts.ACTIVE}
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Wifi className="w-5 h-5" />
            <span className="text-sm hidden md:inline">Online</span>
          </div>
          <button 
            onClick={() => { useKdsStore.setState({ stationId: null, tickets: [] }) }} 
            className="text-sm md:text-base text-gray-400 hover:text-white px-3 py-2 rounded hover:bg-gray-700 min-h-[44px]"
          >
            Cambiar Estación
          </button>
          <button 
            onClick={() => { setUser(null); useKdsStore.setState({ stationId: null, tickets: [] }) }} 
            className="text-sm md:text-base text-red-400 hover:text-red-300 px-3 py-2 rounded hover:bg-gray-700 min-h-[44px]"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Filter bar - Optimizado para tablet */}
      <div className="bg-gray-800/50 px-4 md:px-6 py-2.5 md:py-3 border-b border-gray-700 flex-shrink-0">
        {/* Search input for tickets */}
        <div className="mb-2 md:mb-3">
          <div className="relative w-full max-w-md md:max-w-lg">
            <input 
              type="text" 
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              placeholder="Buscar folio, cliente o mesa..."
              className="w-full px-4 py-2.5 md:py-3 bg-gray-700 text-white rounded-lg text-sm md:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[44px]"
            />
            {ticketSearch && (
              <button 
                onClick={() => setTicketSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex gap-2 md:gap-3 flex-nowrap">
            <button onClick={() => setFilter('active')} className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-bold transition-all whitespace-nowrap min-h-[40px] ${filter === 'active' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
              🔥 Activos ({counts.ACTIVE})
            </button>
            {(['NEW', 'PREPARING', 'READY'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-bold transition-all whitespace-nowrap min-h-[40px] ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {statusLabels[f]}
              </button>
            ))}
            <button onClick={() => setFilter('history')} className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-bold transition-all whitespace-nowrap min-h-[40px] ${filter === 'history' ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
              📋 Hist ({counts.HISTORY})
            </button>
          </div>
          <div className="flex gap-2 md:gap-3 items-center flex-shrink-0">
            {(['today', 'yesterday', 'week', 'all'] as const).map(d => (
              <button key={d} onClick={() => setDateFilter(d)} className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-medium transition-all whitespace-nowrap min-h-[36px] ${dateFilter === d ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {d === 'today' ? 'Hoy' : d === 'yesterday' ? 'Ayer' : d === 'week' ? 'Sem' : 'Todo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets grid - Optimizado para tablet */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ChefHat className="w-16 h-16 md:w-20 md:h-20 mb-4 opacity-20" />
            <p className="text-base md:text-lg">No hay ordenes pendientes</p>
          </div>
        ) : (
          <div className={`grid ${getGridCols()} gap-3 md:gap-4`}>
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
                  {/* Ticket header - Optimizado para tablet */}
                  <div className={`px-4 md:px-5 py-3 md:py-4 flex items-center justify-between ${ticket.priority === 'rush' ? 'bg-red-500 text-white' : 'bg-white/80'}`}>
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <span className="font-bold text-base md:text-lg truncate">{displayFolio(ticket.folio)}</span>
                      {ticket.priority === 'rush' && <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <Timer createdAt={ticket.createdAt} completedAt={ticket.completedAt} deletedAt={ticket.deletedAt} />
                      {ticket.status !== 'SERVED' && ticket.status !== 'CANCELLED' && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          ticket.items.every(i => i.marked) ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {ticket.items.filter(i => i.marked).length}/{ticket.items.length}
                        </span>
                      )}
                      <span className={`text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded-full text-white ${statusBadge[ticket.status]}`}>{statusLabels[ticket.status]}</span>
                    </div>
                  </div>
                  {/* Order type & info - Optimizado para tablet */}
                  <div className="px-4 md:px-5 py-2 md:py-3 flex flex-col md:flex-row justify-between gap-2 text-sm md:text-base border-b border-gray-200/50">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      {ticket.tipo === 'MESA' && (
                        <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2.5 md:px-3 py-1 rounded-full font-semibold text-sm md:text-base">
                          <Utensils className="w-4 h-4" /> MESA {ticket.table}
                        </span>
                      )}
                      {ticket.tipo === 'DOMICILIO' && (
                        <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-2.5 md:px-3 py-1 rounded-full font-semibold text-sm md:text-base">
                          <Truck className="w-4 h-4" /> DOMICILIO
                        </span>
                      )}
                      {ticket.tipo === 'LLEVAR' && (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 md:px-3 py-1 rounded-full font-semibold text-sm md:text-base">
                          <Home className="w-4 h-4" /> LLEVAR
                        </span>
                      )}
                      {!ticket.tipo && ticket.table && (
                        <span className="font-medium">{ticket.table}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-start md:items-end text-sm md:text-base">
                      {ticket.cliente && <span className="font-medium text-gray-700 truncate max-w-[200px]">{ticket.cliente}</span>}
                      {ticket.telefono && <span className="text-gray-500">{ticket.telefono}</span>}
                      {!ticket.cliente && ticket.waiter && <span className="text-gray-500">{ticket.waiter}</span>}
                    </div>
                  </div>
                  {/* Completion time */}
                  {ticket.completedAt && (
                    <div className="px-4 md:px-5 py-1.5 bg-gray-100 text-sm text-gray-600 border-b border-gray-200/50">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Entregado: {new Date(ticket.completedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  {/* Items - Optimizado para tablet con touch targets más grandes */}
                  <div className="px-4 md:px-5 py-3 md:py-4 space-y-2 md:space-y-3 flex-1">
                    {ticket.items.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          // Toggle marca visual del item (subrayado)
                          if (ticket.status !== 'SERVED' && ticket.status !== 'CANCELLED') {
                            toggleItemMarked(ticket.id, item.id);
                          }
                        }}
                        className={`flex items-start gap-3 md:gap-4 py-1.5 md:py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 md:px-3 transition-all min-h-[44px] ${
                          item.marked ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                        }`}
                      >
                        {item.image && (
                          <div className="flex-shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className={`w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border border-gray-200 ${item.marked ? 'opacity-60' : ''}`}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className={`font-bold text-sm md:text-base ${item.marked ? 'text-emerald-700' : 'text-gray-900'}`}>{item.quantity}x</span>
                            <span className={`text-sm md:text-base truncate ${item.marked ? 'line-through decoration-2 decoration-emerald-500 text-emerald-700' : 'text-gray-800'}`}>{item.name}</span>
                          </div>
                          {item.notes && <p className="text-xs md:text-sm text-orange-600 font-medium mt-0.5">{item.notes}</p>}
                        </div>
                        <span className={`text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded flex-shrink-0 ${
                          item.marked ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {item.marked ? '✓' : 'Pend'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Action buttons - Optimizado para tablet */}
                  <div className="px-4 md:px-5 py-3 md:py-4 border-t border-gray-200/50 mt-auto">
                    {filter === 'history' ? (
                      <div className="flex gap-2 md:gap-3">
                        {ticket.deletedAt ? (
                          <button onClick={() => permanentDeleteTicket(ticket.id)} className="flex-1 py-3 md:py-4 rounded-lg font-bold text-sm md:text-base bg-red-600 text-white hover:bg-red-700 min-h-[48px]" title="Eliminar permanentemente">
                            🗑️ Eliminar
                          </button>
                        ) : (
                          <div className="flex-1 py-3 md:py-4 rounded-lg font-bold text-sm md:text-base bg-gray-200 text-gray-600 text-center min-h-[48px] flex items-center justify-center">
                            ✓ Completado
                          </div>
                        )}
                      </div>
                    ) : ticket.status !== 'SERVED' ? (
                      <div className="flex gap-2 md:gap-3">
                        {/* SOLO mostrar botón de despacho cuando todos los items estén marcados */}
                        {ticket.items.every(i => i.marked) ? (
                          <button 
                            onClick={() => bumpTicket(ticket.id)} 
                            className="flex-1 py-3 md:py-4 rounded-lg font-bold text-sm md:text-base text-white transition-all active:scale-95 bg-blue-500 hover:bg-blue-600 min-h-[48px]"
                          >
                            🚀 Despachar
                          </button>
                        ) : (
                          <div className="flex-1 py-3 md:py-4 rounded-lg font-bold text-sm md:text-base bg-gray-100 text-gray-500 text-center min-h-[48px] flex items-center justify-center">
                            👆 Click en items para marcar listos
                          </div>
                        )}
                        <button onClick={() => deleteTicket(ticket.id)} className="px-4 md:px-5 py-3 md:py-4 rounded-lg font-bold text-sm md:text-base bg-red-500 text-white hover:bg-red-600 min-h-[48px] min-w-[48px]" title="Cancelar orden">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 md:gap-3">
                        <button onClick={() => recallTicket(ticket.id)} className="flex-1 py-3 md:py-4 rounded-lg font-bold text-sm md:text-base bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center gap-2 min-h-[48px]">
                          <RotateCcw className="w-5 h-5" /> Reabrir
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
