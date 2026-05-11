import React, { useState, useEffect } from 'react'
import { Coffee, Flame, Snowflake, ChefHat, Beef, Cake } from 'lucide-react'
import { useKdsStore } from '../stores/useKdsStore'

interface Station {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
  bgColor: string
  pendingCount?: number
}

const STATION_COLORS: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
  'bar': { 
    color: '#059669', // Verde Country Club
    bgColor: '#d1fae5', // emerald-100
    icon: <Coffee className="w-12 h-12" />
  },
  'cocina-caliente': { 
    color: '#ef4444', 
    bgColor: '#fee2e2',
    icon: <Flame className="w-12 h-12" />
  },
  'cocina-fria': { 
    color: '#06b6d4', 
    bgColor: '#cffafe',
    icon: <Snowflake className="w-12 h-12" />
  },
  'cocina-general': { 
    color: '#8b5cf6', 
    bgColor: '#ede9fe',
    icon: <ChefHat className="w-12 h-12" />
  },
  'parrilla': { 
    color: '#f97316', 
    bgColor: '#ffedd5',
    icon: <Beef className="w-12 h-12" />
  },
  'postres': { 
    color: '#ec4899', 
    bgColor: '#fce7f3',
    icon: <Cake className="w-12 h-12" />
  }
}

export function KdsStationSelector() {
  const [selectedStation, setSelectedStation] = useState<string>('')
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const { setStationId, tickets } = useKdsStore()

  // Cargar estaciones desde API
  useEffect(() => {
    const loadStations = async () => {
      try {
        console.log('📡 Cargando estaciones desde API...')
        const response = await fetch('http://localhost:3004/api/stations')
        console.log('📡 Respuesta API estaciones:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📡 Estaciones recibidas:', data.length, data)
          
          const activeStations = data
            .filter((s: any) => s.isActive)
            .map((s: any) => {
              const stationKey = s.name.toLowerCase().replace(/\s+/g, '-')
              const config = STATION_COLORS[stationKey] || STATION_COLORS['cocina-general']
              
              // Contar pedidos pendientes para esta estación
              const pendingCount = tickets.filter(t => 
                t.status !== 'SERVED' && t.status !== 'CANCELLED'
              ).length
              
              return {
                id: s.id,
                name: s.displayName || s.name,
                description: `Estación de ${s.displayName || s.name}`,
                color: config.color,
                bgColor: config.bgColor,
                icon: config.icon,
                pendingCount
              }
            })
          console.log('✅ Estaciones activas:', activeStations.length)
          setStations(activeStations)
        } else {
          console.error('❌ Error API estaciones:', response.status, await response.text())
        }
      } catch (error) {
        console.error('❌ Error cargando estaciones:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStations()
  }, [tickets])

  const handleStationSelect = (stationId: string, stationName: string) => {
    setSelectedStation(stationId)
    setStationId(stationId)
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('kds_current_station', stationId)
    localStorage.setItem('kds_current_station_name', stationName)
    
    console.log(`✅ Estación seleccionada: ${stationName} (${stationId})`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando estaciones...</p>
        </div>
      </div>
    )
  }

  // Si no hay estaciones, mostrar mensaje de error
  if (stations.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 p-6 rounded-2xl mb-4">
            <ChefHat className="w-16 h-16 text-red-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No se encontraron estaciones
          </h2>
          <p className="text-gray-600 mb-4">
            No hay estaciones configuradas en el sistema o no se pudo conectar con el servidor.
          </p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Verifica que:</p>
            <ul className="list-disc list-inside mt-2">
              <li>El servidor API está corriendo (puerto 3004)</li>
              <li>Hay estaciones configuradas en el Admin Panel</li>
              <li>Las estaciones están marcadas como "activas"</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="btn-tablet btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block bg-green-100 p-4 rounded-2xl mb-4">
            <ChefHat className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
            Kitchen Display System
          </h1>
          <p className="text-lg md:text-2xl text-gray-600">
            YCC Country Club
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700">Sistema Activo</span>
          </div>
        </div>

        {/* Instrucción */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
            Selecciona tu Estación de Trabajo
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Toca la estación donde trabajarás hoy
          </p>
        </div>

        {/* Grid de estaciones - 2 columnas en tablets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => handleStationSelect(station.id, station.name)}
              className={`
                card-tablet p-6 md:p-8 text-left
                transition-all duration-300
                active:scale-95
                ${
                  selectedStation === station.id
                    ? 'ring-4 ring-green-500 ring-offset-2 shadow-2xl'
                    : 'hover:shadow-xl'
                }
              `}
              style={{
                borderColor: selectedStation === station.id ? station.color : undefined
              }}
            >
              {/* Header con icono y badge */}
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: station.bgColor }}
                >
                  <div style={{ color: station.color }}>
                    {station.icon}
                  </div>
                </div>
                
                {station.pendingCount !== undefined && station.pendingCount > 0 && (
                  <div 
                    className="px-3 py-1 rounded-full text-white font-bold text-sm"
                    style={{ backgroundColor: station.color }}
                  >
                    {station.pendingCount} pedidos
                  </div>
                )}
              </div>

              {/* Nombre de la estación */}
              <h3 
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: station.color }}
              >
                {station.name}
              </h3>

              {/* Descripción */}
              <p className="text-base md:text-lg text-gray-600 mb-4">
                {station.description}
              </p>

              {/* Footer con estado */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                <span className="text-sm text-gray-500 font-medium">
                  Toca para seleccionar
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-semibold">Activa</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer con información */}
        <div className="text-center mt-8 md:mt-12">
          <div className="inline-block bg-gray-50 px-6 py-4 rounded-xl">
            <p className="text-sm md:text-base text-gray-600">
              💡 <strong>Tip:</strong> Tu selección se guardará automáticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
