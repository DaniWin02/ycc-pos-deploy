import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ChefHat, LogOut, User, Filter, History } from 'lucide-react'
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
  const { tickets, loadTickets } = useKdsStore()
  
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
        <header className="bg-white border-b-2 border-gray-200 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-2 rounded-xl">
                <ChefHat className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-xl">
                  Selecciona tu Estación
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {currentUser.name}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-tablet btn-danger flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Contenido - Selector de Estaciones */}
        <main className="flex-1 flex items-center justify-center p-6">
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Principal */}
      <header className="bg-white border-b-2 border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Info de usuario y turno */}
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-2 rounded-xl">
              <ChefHat className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">
                Kitchen Display System
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {currentUser.name}
                </span>
              </div>
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="hidden md:flex items-center gap-2">
            <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
              <span className="text-xs text-blue-600 font-medium">Nuevos</span>
              <span className="ml-2 text-lg font-bold text-blue-700">{newCount}</span>
            </div>
            <div className="bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <span className="text-xs text-amber-600 font-medium">Preparando</span>
              <span className="ml-2 text-lg font-bold text-amber-700">{preparingCount}</span>
            </div>
            <div className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              <span className="text-xs text-green-600 font-medium">Listos</span>
              <span className="ml-2 text-lg font-bold text-green-700">{readyCount}</span>
            </div>
          </div>

          {/* Botón logout */}
          <button
            onClick={handleLogout}
            className="btn-tablet btn-danger flex items-center gap-2"
            style={{ minHeight: '44px' }}
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Banner de Estación Actual */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">
              Estación actual: <strong className="text-gray-900">
                {selectedStationId 
                  ? stations.find(s => s.id === selectedStationId)?.displayName || 'Estación seleccionada'
                  : 'Todas las estaciones'
                }
              </strong>
            </span>
          </div>
          <button
            onClick={handleChangeStation}
            className="btn-tablet bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Cambiar Estación
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="bg-white border-b-2 border-gray-200 px-4">
        <div className="max-w-7xl mx-auto flex gap-2">
          <button
            onClick={() => setCurrentView('comandas')}
            className={`
              px-6 py-3 font-bold text-lg transition-all border-b-4
              ${currentView === 'comandas'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Comandas Activas
              <span className={`
                px-2 py-1 rounded-full text-sm font-bold
                ${currentView === 'comandas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}
              `}>
                {newCount}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('historial')}
            className={`
              px-6 py-3 font-bold text-lg transition-all border-b-4
              ${currentView === 'historial'
                ? 'border-amber-600 text-amber-600 bg-amber-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial
              <span className={`
                px-2 py-1 rounded-full text-sm font-bold
                ${currentView === 'historial' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'}
              `}>
                {preparingCount + readyCount}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-hidden p-4 md:p-6">
        {currentView === 'comandas' ? (
          // Vista de Comandas Activas (Scroll Horizontal)
          <div className="h-full overflow-x-auto overflow-y-hidden">
            {orderedActiveTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="bg-green-50 p-8 rounded-3xl mb-6">
                  <ChefHat className="w-24 h-24 text-green-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  ¡Todo al día!
                </h2>
                <p className="text-lg text-gray-600 text-center">
                  No hay comandas activas
                </p>
              </div>
            ) : (
              <div className="flex gap-4 pb-4 h-full" style={{ minWidth: 'max-content' }}>
                <AnimatePresence mode="popLayout">
                  {orderedActiveTickets.map((ticket: KdsTicket) => (
                    <div key={ticket.id} className="flex-shrink-0" style={{ width: '320px' }}>
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
          // Vista de Historial (Scroll Vertical)
          <div className="h-full overflow-y-auto max-w-4xl mx-auto">
            <KdsHistory selectedStationId={selectedStationId} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="font-medium">
              Activas: <strong className="text-gray-900">{newCount}</strong> | 
              Historial: <strong className="text-gray-900">{preparingCount + readyCount}</strong>
            </span>
            <span className="hidden md:inline text-gray-400">
              Última actualización: {new Date().toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            YCC Country Club © 2026
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppNew
