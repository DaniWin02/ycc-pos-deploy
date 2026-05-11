import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ChefHat, LogOut, User, Filter, History, Trash2 } from 'lucide-react'
import { useKdsStore, KdsTicket } from './stores/useKdsStore'
import { KdsLogin } from './components/KdsLogin'
import { KdsStationFilter } from './components/KdsStationFilter'
import { KdsTicketNew } from './components/KdsTicketNew'
import { KdsHistory } from './components/KdsHistory'

interface Station {
  id: string
  name: string
  displayName: string
  color: string
  bgColor: string
  icon: React.ReactNode | null
  pendingCount: number
  isActive: boolean
}

interface User {
  id: string
  name: string
  role: string
}

function AppNew() {
  const { tickets, loadTickets, clearHistory, clearHistoryByStation, deleteTicket, forceClearAll, checkAndClearForNewDay, cleanOldTickets } = useKdsStore()
  
  // Estados del flujo
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [stationSelected, setStationSelected] = useState(false) // Nueva bandera para controlar si ya seleccionó estación
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [stationsError, setStationsError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'comandas' | 'historial'>('comandas') // Vista actual

  const ui = {
    appBg: 'var(--background, #f9fafb)',
    surface: 'var(--card, #ffffff)',
    border: 'var(--border, #e5e7eb)',
    text: 'var(--foreground, #111827)',
    textMuted: 'var(--muted-foreground, #4b5563)',
    primary: 'var(--primary, #059669)', // Verde Country Club
    primaryForeground: 'var(--primary-foreground, #ffffff)',
    success: 'var(--success, #16a34a)',
    danger: 'var(--destructive, #dc2626)',
    warning: 'var(--warning, #d97706)',
  }

  // Cargar sesión persistida al iniciar (verificar nuevo día)
  useEffect(() => {
    const checkPersistedSession = () => {
      try {
        // Primero verificar y limpiar si es nuevo día usando el store
        const isNewDay = checkAndClearForNewDay()
        
        if (isNewDay) {
          console.log('📅 Nuevo día detectado - Limpiando sesión y comandas de KDS')
          localStorage.removeItem('kds-user')
          localStorage.removeItem('kds-station-id')
          localStorage.setItem('kds-last-session-date', new Date().toISOString().split('T')[0])
          // Recargar para asegurar estado limpio
          window.location.reload()
          return
        }
        
        // Cargar usuario y estación si existen
        const storedUser = localStorage.getItem('kds-user')
        const storedStationId = localStorage.getItem('kds-station-id')
        
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setCurrentUser(user)
          console.log('✅ Sesión de KDS restaurada:', user.name)
          
          if (storedStationId) {
            setSelectedStationId(storedStationId)
            setStationSelected(true)
          }
        }
      } catch (error) {
        console.error('Error cargando sesión persistida:', error)
      }
    }
    
    checkPersistedSession()
    
    // Verificar cada minuto si es nuevo día
    const interval = setInterval(() => {
      if (checkAndClearForNewDay()) {
        window.location.reload()
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [checkAndClearForNewDay])

  // Limpieza automática diaria al cambiar de fecha (medianoche local)
  useEffect(() => {
    let midnightTimeout: ReturnType<typeof setTimeout> | null = null

    const scheduleNextMidnightReset = () => {
      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 0, 0)
      const msUntilMidnight = nextMidnight.getTime() - now.getTime()

      midnightTimeout = setTimeout(() => {
        console.log('🧹 Reinicio diario KDS: limpiando comandas e historial')

        // Limpiar store (comandas activas + historial + blacklist local)
        forceClearAll()

        // Limpiar sesión de operador/estación para iniciar turno limpio
        localStorage.removeItem('kds-user')
        localStorage.removeItem('kds-station-id')
        localStorage.setItem('kds-last-session-date', new Date().toISOString().split('T')[0])

        // Recargar la app para estado completamente consistente
        window.location.reload()
      }, msUntilMidnight + 1000) // +1s para asegurar cambio de día
    }

    scheduleNextMidnightReset()

    return () => {
      if (midnightTimeout) clearTimeout(midnightTimeout)
    }
  }, [forceClearAll])

  // Limpieza automática de tickets antiguos cada hora
  useEffect(() => {
    // Limpiar tickets antiguos al iniciar
    console.log('🧹 Verificando tickets antiguos al iniciar KDS...')
    cleanOldTickets(24)

    // Programar limpieza cada hora
    const hourlyCleanup = setInterval(() => {
      console.log('🧹 Limpieza programada de tickets antiguos (cada hora)...')
      cleanOldTickets(24)
    }, 60 * 60 * 1000) // 1 hora

    return () => clearInterval(hourlyCleanup)
  }, [cleanOldTickets])

  // Cargar estaciones al iniciar
  useEffect(() => {
    const loadStations = async () => {
      const maxRetries = 5
      let lastError = 'No se pudieron cargar estaciones'

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch('http://localhost:3004/api/stations')
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const data = await response.json()
          const mappedStations = (data || [])
            .filter((s: any) => s.isActive)
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              displayName: s.displayName || s.name,
              color: s.color || '#16a34a',
              bgColor: s.bgColor || '#dcfce7',
              icon: null,
              pendingCount: 0,
              isActive: s.isActive
            }))

          setStations(mappedStations)
          setStationsError(null)
          setLoading(false)
          return
        } catch (error: any) {
          lastError = error?.message || lastError
          console.error(`Error cargando estaciones (intento ${attempt}/${maxRetries}):`, error)
          // Backoff simple: 1s, 2s, 3s, ...
          await new Promise(resolve => setTimeout(resolve, attempt * 1000))
        }
      }

      setStations([])
      setStationsError(lastError)
      setLoading(false)
    }
    loadStations()
  }, [])

  // Cargar tickets periódicamente
  useEffect(() => {
    if (currentUser) {
      loadTickets()
      const interval = setInterval(loadTickets, 5000)
      return () => clearInterval(interval)
    }
  }, [currentUser, loadTickets])

  // Calcular conteos por estación
  useEffect(() => {
    const updatedStations = stations.map(station => {
      const count = tickets.filter(t => 
        t.status !== 'SERVED' && 
        t.status !== 'CANCELLED' &&
        t.items.some(item => item.stationId === station.id)
      ).length
      return { ...station, pendingCount: count }
    })
    setStations(updatedStations)
  }, [tickets])

  // Handlers
  const handleLogin = (user: User) => {
    console.log('✅ Login exitoso:', user.name)
    setCurrentUser(user)
    
    // Persistir sesión en localStorage
    try {
      localStorage.setItem('kds-user', JSON.stringify(user))
      console.log('💾 Sesión de KDS guardada en localStorage')
    } catch (error) {
      console.error('Error guardando sesión:', error)
    }
  }

  const handleLogout = () => {
    if (window.confirm('¿Cerrar sesión?')) {
      setCurrentUser(null)
      setSelectedStationId(null)
      setStationSelected(false)
      
      // Limpiar sesión de localStorage
      try {
        localStorage.removeItem('kds-user')
        localStorage.removeItem('kds-station-id')
        console.log('🧹 Sesión de KDS eliminada de localStorage')
      } catch (error) {
        console.error('Error limpiando sesión:', error)
      }
    }
  }

  const handleSelectStation = (stationId: string | null) => {
    console.log('🔍 Estación seleccionada:', stationId || 'Todas')
    setSelectedStationId(stationId)
    setStationSelected(true) // Marcar que ya seleccionó estación
    
    // Persistir estación seleccionada
    if (stationId) {
      localStorage.setItem('kds-station-id', stationId)
    }
  }

  const handleChangeStation = () => {
    setStationSelected(false) // Volver a la pantalla de selección de estación
    localStorage.removeItem('kds-station-id') // Limpiar estación guardada
  }

  // Calcular tickets en historial para la confirmación
  const historyTickets = tickets.filter(ticket => {
    if (ticket.status !== 'PREPARING' && ticket.status !== 'READY') return false
    if (ticket.deletedAt) return false
    if (selectedStationId) {
      return ticket.items.some(item => item.stationId === selectedStationId)
    }
    return true
  })

  // Manejar limpieza del historial desde el header
  const handleClearHistory = () => {
    const count = historyTickets.length
    if (count === 0) {
      alert('No hay pedidos en el historial para limpiar')
      return
    }
    
    const scope = selectedStationId 
      ? `de ESTA ESTACIÓN (${count} pedidos)` 
      : `de TODAS LAS ESTACIONES (${count} pedidos)`
    
    const warning = selectedStationId
      ? `¿Limpiar el historial ${scope}?\n\n⚠️ Solo se limpiarán los pedidos visibles en esta estación.`
      : `¿Limpiar el historial ${scope}?\n\n⚠️ ATENCIÓN: Esto afecta TODAS las estaciones (Cocina, Bar, Parrilla, etc.).\n\nTodos los pedidos en preparación serán marcados como completados.`
    
    if (window.confirm(warning)) {
      if (selectedStationId) {
        clearHistoryByStation(selectedStationId)
      } else {
        clearHistory()
      }
    }
  }

  // Manejar limpieza de comandas activas (NEW)
  const handleClearActive = () => {
    const count = activeTickets.length
    if (count === 0) {
      alert('No hay comandas activas para limpiar')
      return
    }
    
    const scope = selectedStationId 
      ? `de ESTA ESTACIÓN (${count} comandas)` 
      : `de TODAS LAS ESTACIONES (${count} comandas)`
    
    const warning = selectedStationId
      ? `¿Cancelar todas las comandas activas ${scope}?\n\n⚠️ Solo se cancelarán las comandas visibles en esta estación.`
      : `¿Cancelar todas las comandas activas ${scope}?\n\n⚠️ ATENCIÓN: Esto afecta TODAS las estaciones (Cocina, Bar, Parrilla, etc.).\n\nTodas las comandas nuevas serán canceladas.`
    
    if (window.confirm(warning)) {
      // Cancelar todas las comandas activas
      activeTickets.forEach(ticket => {
        deleteTicket(ticket.id)
      })
    }
  }

  // FILTRADO: Separar comandas activas (NEW) del historial (PREPARING/READY)
  const activeTickets = tickets.filter(ticket => {
    // Solo tickets NEW (comandas activas)
    if (ticket.status !== 'NEW') return false
    if (ticket.deletedAt) return false

    // Si hay filtro por estación, verificar items de esa estación
    if (selectedStationId) {
      return ticket.items.some(item => item.stationId === selectedStationId)
    }

    return ticket.items && ticket.items.length > 0
  })

  // Ordenar por tiempo (más antiguos primero)
  const sortByTime = (a: KdsTicket, b: KdsTicket) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  }

  const orderedActiveTickets = [...activeTickets].sort(sortByTime)

  // CONTAR POR ESTADO (solo comandas activas)
  const newCount = orderedActiveTickets.length
  
  // Contar historial (PREPARING y READY)
  const preparingCount = tickets.filter(t => 
    t.status === 'PREPARING' && !t.deletedAt &&
    (!selectedStationId || t.items.some(item => item.stationId === selectedStationId))
  ).length
  
  const readyCount = tickets.filter(t => 
    t.status === 'READY' && !t.deletedAt &&
    (!selectedStationId || t.items.some(item => item.stationId === selectedStationId))
  ).length

  // PASO 1: Login con PIN
  if (!currentUser) {
    return <KdsLogin onLogin={handleLogin} />
  }

  // PASO 2: Seleccionar Estación (pantalla completa)
  if (!stationSelected) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: ui.appBg }}>
        {/* Header */}
        <header className="border-b-2 px-fluid-sm py-fluid-sm" style={{ backgroundColor: ui.surface, borderColor: ui.border }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#dcfce7' }}>
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: ui.success }} />
              </div>
              <div>
                <h1 className="font-bold text-fluid-lg sm:text-fluid-xl" style={{ color: ui.text }}>
                  Selecciona tu Estación
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 text-fluid-xs sm:text-fluid-sm" style={{ color: ui.textMuted }}>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    {currentUser.name}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="kds-touch bg-[var(--danger)] hover:bg-[var(--danger)] text-[var(--danger-foreground)] rounded-xl flex items-center gap-1 sm:gap-2 px-3 py-2 active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-fluid-sm">Salir</span>
            </button>
          </div>
        </header>

        {/* Contenido - Selector de Estaciones */}
        <main className="flex-1 flex items-center justify-center p-fluid-md sm:p-fluid-lg">
          <div className="w-full max-w-4xl">
            {stations.length > 0 ? (
              <KdsStationFilter
                stations={stations}
                selectedStationId={selectedStationId}
                onSelectStation={handleSelectStation}
              />
            ) : (
              <div className="border rounded-2xl p-6 text-center" style={{ backgroundColor: ui.surface, borderColor: '#fecaca' }}>
                <p className="font-semibold mb-2" style={{ color: ui.danger }}>No se pudieron cargar estaciones</p>
                <p className="text-sm mb-4" style={{ color: ui.textMuted }}>
                  {stationsError || 'Verifica que el API (puerto 3004) esté disponible.'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="kds-touch bg-[var(--info)] hover:bg-[var(--info)] text-[var(--info-foreground)] rounded-xl px-4 py-2 font-semibold"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Helper seguro para nombre corto en mobile (evita .split sobre undefined/null)
  const currentUserName = (currentUser?.name || '').trim()
  const currentUserShortName = currentUserName ? currentUserName.split(' ')[0] : 'Usuario'

  // PASO 4: Vista Principal con Pedidos
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: ui.appBg }}>
      {/* Header Principal */}
      <header className="border-b-2 px-fluid-sm py-fluid-xs flex-shrink-0" style={{ backgroundColor: ui.surface, borderColor: ui.border }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Info de usuario y turno */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-1.5 sm:p-2 rounded-xl" style={{ backgroundColor: '#dcfce7' }}>
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: ui.success }} />
            </div>
            <div>
              <h1 className="font-bold text-fluid-base sm:text-fluid-lg" style={{ color: ui.text }}>
                Kitchen Display
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 text-fluid-xs" style={{ color: ui.textMuted }}>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{currentUserName || 'Usuario'}</span>
                  <span className="sm:hidden">{currentUserShortName}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
              <span className="text-fluid-xs font-medium" style={{ color: ui.primary }}>Nuevos</span>
              <span className="ml-1 sm:ml-2 text-fluid-base sm:text-fluid-lg font-bold" style={{ color: ui.primary }}>{newCount}</span>
            </div>
            <div className="bg-[var(--warning-light)] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[var(--warning)]">
              <span className="text-fluid-xs text-[var(--warning)] font-medium">Prep</span>
              <span className="ml-1 sm:ml-2 text-fluid-base sm:text-fluid-lg font-bold text-[var(--warning)]">{preparingCount}</span>
            </div>
            <div className="bg-[var(--success-light)] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[var(--success)]">
              <span className="text-fluid-xs text-[var(--success)] font-medium">Listos</span>
              <span className="ml-1 sm:ml-2 text-fluid-base sm:text-fluid-lg font-bold text-[var(--success)]">{readyCount}</span>
            </div>
          </div>

          {/* Botón logout */}
          <button
            onClick={handleLogout}
            className="kds-touch bg-[var(--danger)] hover:bg-[var(--danger)] text-[var(--danger-foreground)] rounded-xl flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden md:inline text-fluid-sm">Salir</span>
          </button>
        </div>
      </header>

      {/* Banner de Estación Actual */}
      <div className="border-b px-fluid-sm py-2 flex-shrink-0" style={{ backgroundColor: ui.surface, borderColor: ui.border }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ui.textMuted }} />
            <span className="text-fluid-xs sm:text-fluid-sm" style={{ color: ui.textMuted }}>
              <span className="hidden sm:inline">Estación actual: </span>
              <strong style={{ color: ui.text }}>
                {selectedStationId 
                  ? stations.find(s => s.id === selectedStationId)?.displayName || 'Estación'
                  : 'Todas'
                }
              </strong>
            </span>
          </div>
          <button
            onClick={handleChangeStation}
            className="kds-touch text-white rounded-xl flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 active:scale-95 transition-all text-fluid-xs sm:text-fluid-sm font-semibold"
            style={{ backgroundColor: ui.primary }}
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cambiar</span>
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="border-b-2 px-fluid-sm flex-shrink-0" style={{ backgroundColor: ui.surface, borderColor: ui.border }}>
        <div className="max-w-7xl mx-auto flex gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('comandas')}
            className={`
              px-3 sm:px-6 py-2 sm:py-3 font-bold text-fluid-sm sm:text-fluid-base transition-all border-b-4
              ${currentView === 'comandas'
                ? 'border-[var(--info)] text-[var(--info)] bg-[var(--info-light)]'
                : 'border-transparent'
              }
            `}
            style={currentView === 'comandas' ? undefined : { color: ui.textMuted }}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Comandas</span>
              <span className={`
                px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-fluid-xs font-bold
                ${currentView === 'comandas' ? 'bg-[var(--info)] text-[var(--info-foreground)]' : 'bg-[var(--muted)]'}
              `}>
                {newCount}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('historial')}
            className={`
              px-3 sm:px-6 py-2 sm:py-3 font-bold text-fluid-sm sm:text-fluid-base transition-all border-b-4
              ${currentView === 'historial'
                ? 'border-[var(--warning)] text-[var(--warning)] bg-[var(--warning-light)]'
                : 'border-transparent'
              }
            `}
            style={currentView === 'historial' ? undefined : { color: ui.textMuted }}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Historial</span>
              <span className={`
                px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-fluid-xs font-bold
                ${currentView === 'historial' ? 'bg-[var(--warning)] text-[var(--warning-foreground)]' : 'bg-[var(--muted)]'}
              `}>
                {preparingCount + readyCount}
              </span>
            </div>
          </button>

          {/* Botón Limpiar Comandas - solo visible en vista comandas */}
          {currentView === 'comandas' && (
            <button
              onClick={handleClearActive}
              className={`
                ml-2 px-3 sm:px-4 py-2 sm:py-3 font-bold text-fluid-sm sm:text-fluid-base transition-all rounded-lg flex items-center gap-1 sm:gap-2
                ${selectedStationId 
                  ? 'bg-[var(--danger-light)] text-[var(--danger)] hover:bg-[var(--danger)] border border-[var(--danger)]' 
                  : 'bg-[var(--danger-light)] text-[var(--danger)] hover:bg-[var(--danger)] border border-[var(--danger)]'}
              `}
              title={selectedStationId ? 'Cancelar todas las comandas de esta estación' : 'Cancelar todas las comandas'}
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}

          {/* Botón Limpiar Historial - solo visible en vista historial */}
          {currentView === 'historial' && (
            <button
              onClick={handleClearHistory}
              className={`
                ml-2 px-3 sm:px-4 py-2 sm:py-3 font-bold text-fluid-sm sm:text-fluid-base transition-all rounded-lg flex items-center gap-1 sm:gap-2
                ${selectedStationId 
                  ? 'bg-[var(--warning-light)] text-[var(--warning)] hover:bg-[var(--warning)] border border-[var(--warning)]' 
                  : 'bg-[var(--danger-light)] text-[var(--danger)] hover:bg-[var(--danger)] border border-[var(--danger)]'}
              `}
              title={selectedStationId ? 'Limpiar historial de esta estación' : 'Limpiar historial de todas las estaciones'}
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-hidden p-2 sm:p-4">
        {currentView === 'comandas' ? (
          // Vista de Comandas Activas (Scroll Horizontal)
          <div className="h-full overflow-x-auto overflow-y-hidden kds-scrollbar">
            {orderedActiveTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="p-6 sm:p-8 rounded-3xl mb-4 sm:mb-6" style={{ backgroundColor: '#f0fdf4' }}>
                  <ChefHat className="w-16 h-16 sm:w-24 sm:h-24" style={{ color: ui.success }} />
                </div>
                <h2 className="text-fluid-xl sm:text-fluid-2xl font-bold mb-2" style={{ color: ui.text }}>
                  ¡Todo al día!
                </h2>
                <p className="text-fluid-base text-center" style={{ color: ui.textMuted }}>
                  No hay comandas activas
                </p>
              </div>
            ) : (
              <div className="flex gap-2 sm:gap-4 pb-2 sm:pb-4 h-full" style={{ minWidth: 'max-content' }}>
                <AnimatePresence mode="popLayout">
                  {orderedActiveTickets.map((ticket: KdsTicket) => (
                    <div key={ticket.id} className="flex-shrink-0 h-full" style={{ width: 'min(320px, 90vw)', minHeight: '500px' }}>
                      <KdsTicketNew 
                        ticket={ticket}
                        selectedStationId={selectedStationId}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          // Vista de Historial (Scroll Vertical - Lista)
          <div className="h-full overflow-y-auto kds-scrollbar max-w-4xl mx-auto">
            <KdsHistory selectedStationId={selectedStationId} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 px-fluid-sm py-2 flex-shrink-0" style={{ backgroundColor: ui.surface, borderColor: ui.border }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between text-fluid-xs sm:text-fluid-sm" style={{ color: ui.textMuted }}>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="font-medium">
              <span className="hidden sm:inline">Activas: </span>
              <strong style={{ color: ui.text }}>{newCount}</strong>
              <span className="mx-1">|</span>
              <span className="hidden sm:inline">Historial: </span>
              <strong style={{ color: ui.text }}>{preparingCount + readyCount}</strong>
            </span>
            <span className="hidden lg:inline" style={{ color: '#9ca3af' }}>
              {new Date().toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="text-fluid-xs" style={{ color: ui.textMuted }}>
            YCC © 2026
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppNew
