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
  const { tickets, loadTickets, clearHistory, clearHistoryByStation, deleteTicket } = useKdsStore()
  
  // Estados del flujo
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [stationSelected, setStationSelected] = useState(false) // Nueva bandera para controlar si ya seleccionó estación
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'comandas' | 'historial'>('comandas') // Vista actual

  // Cargar estaciones al iniciar
  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await fetch('http://localhost:3004/api/stations')
        if (response.ok) {
          const data = await response.json()
          const mappedStations = data
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
        }
      } catch (error) {
        console.error('Error cargando estaciones:', error)
      } finally {
        setLoading(false)
      }
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
  }

  const handleLogout = () => {
    if (window.confirm('¿Cerrar sesión?')) {
      setCurrentUser(null)
      setSelectedStationId(null)
      setStationSelected(false)
    }
  }

  const handleSelectStation = (stationId: string | null) => {
    console.log('🔍 Estación seleccionada:', stationId || 'Todas')
    setSelectedStationId(stationId)
    setStationSelected(true) // Marcar que ya seleccionó estación
  }

  const handleChangeStation = () => {
    setStationSelected(false) // Volver a la pantalla de selección de estación
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b-2 border-gray-200 px-fluid-sm py-fluid-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="bg-green-100 p-2 rounded-xl">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-fluid-lg sm:text-fluid-xl">
                  Selecciona tu Estación
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 text-fluid-xs sm:text-fluid-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    {currentUser.name}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="kds-touch bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center gap-1 sm:gap-2 px-3 py-2 active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-fluid-sm">Salir</span>
            </button>
          </div>
        </header>

        {/* Contenido - Selector de Estaciones */}
        <main className="flex-1 flex items-center justify-center p-fluid-md sm:p-fluid-lg">
          <div className="w-full max-w-4xl">
            <KdsStationFilter
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={handleSelectStation}
            />
          </div>
        </main>
      </div>
    )
  }

  // PASO 4: Vista Principal con Pedidos
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header Principal */}
      <header className="bg-white border-b-2 border-gray-200 px-fluid-sm py-fluid-xs flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Info de usuario y turno */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-green-100 p-1.5 sm:p-2 rounded-xl">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-fluid-base sm:text-fluid-lg">
                Kitchen Display
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 text-fluid-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{currentUser.name}</span>
                  <span className="sm:hidden">{currentUser.name.split(' ')[0]}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-blue-200">
              <span className="text-fluid-xs text-blue-600 font-medium">Nuevos</span>
              <span className="ml-1 sm:ml-2 text-fluid-base sm:text-fluid-lg font-bold text-blue-700">{newCount}</span>
            </div>
            <div className="bg-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-amber-200">
              <span className="text-fluid-xs text-amber-600 font-medium">Prep</span>
              <span className="ml-1 sm:ml-2 text-fluid-base sm:text-fluid-lg font-bold text-amber-700">{preparingCount}</span>
            </div>
            <div className="bg-green-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-green-200">
              <span className="text-fluid-xs text-green-600 font-medium">Listos</span>
              <span className="ml-1 sm:ml-2 text-fluid-base sm:text-fluid-lg font-bold text-green-700">{readyCount}</span>
            </div>
          </div>

          {/* Botón logout */}
          <button
            onClick={handleLogout}
            className="kds-touch bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden md:inline text-fluid-sm">Salir</span>
          </button>
        </div>
      </header>

      {/* Banner de Estación Actual */}
      <div className="bg-white border-b border-gray-200 px-fluid-sm py-2 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-fluid-xs sm:text-fluid-sm text-gray-700">
              <span className="hidden sm:inline">Estación actual: </span>
              <strong className="text-gray-900">
                {selectedStationId 
                  ? stations.find(s => s.id === selectedStationId)?.displayName || 'Estación'
                  : 'Todas'
                }
              </strong>
            </span>
          </div>
          <button
            onClick={handleChangeStation}
            className="kds-touch bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 active:scale-95 transition-all text-fluid-xs sm:text-fluid-sm font-semibold"
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cambiar</span>
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="bg-white border-b-2 border-gray-200 px-fluid-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto flex gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('comandas')}
            className={`
              px-3 sm:px-6 py-2 sm:py-3 font-bold text-fluid-sm sm:text-fluid-base transition-all border-b-4
              ${currentView === 'comandas'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Comandas</span>
              <span className={`
                px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-fluid-xs font-bold
                ${currentView === 'comandas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}
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
                ? 'border-amber-600 text-amber-600 bg-amber-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Historial</span>
              <span className={`
                px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-fluid-xs font-bold
                ${currentView === 'historial' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'}
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
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'}
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
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'}
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
                <div className="bg-green-50 p-6 sm:p-8 rounded-3xl mb-4 sm:mb-6">
                  <ChefHat className="w-16 h-16 sm:w-24 sm:h-24 text-green-600" />
                </div>
                <h2 className="text-fluid-xl sm:text-fluid-2xl font-bold text-gray-800 mb-2">
                  ¡Todo al día!
                </h2>
                <p className="text-fluid-base text-gray-600 text-center">
                  No hay comandas activas
                </p>
              </div>
            ) : (
              <div className="flex gap-2 sm:gap-4 pb-2 sm:pb-4 h-full" style={{ minWidth: 'max-content' }}>
                <AnimatePresence mode="popLayout">
                  {orderedActiveTickets.map((ticket: KdsTicket) => (
                    <div key={ticket.id} className="flex-shrink-0" style={{ width: 'min(320px, 90vw)' }}>
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
      <footer className="bg-white border-t-2 border-gray-200 px-fluid-sm py-2 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-fluid-xs sm:text-fluid-sm text-gray-600">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="font-medium">
              <span className="hidden sm:inline">Activas: </span>
              <strong className="text-gray-900">{newCount}</strong>
              <span className="mx-1">|</span>
              <span className="hidden sm:inline">Historial: </span>
              <strong className="text-gray-900">{preparingCount + readyCount}</strong>
            </span>
            <span className="hidden lg:inline text-gray-400">
              {new Date().toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="text-fluid-xs text-gray-500">
            YCC © 2026
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppNew
