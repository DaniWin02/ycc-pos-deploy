import React from 'react'
import { Coffee, Flame, Snowflake, ChefHat, Beef, Cake, LayoutGrid } from 'lucide-react'

interface Station {
  id: string
  name: string
  displayName: string
  color: string
  bgColor: string
  icon: React.ReactNode
  pendingCount: number
  isActive: boolean
}

interface KdsStationFilterProps {
  stations: Station[]
  selectedStationId: string | null  // null = ver todas las estaciones
  onSelectStation: (stationId: string | null) => void
}

const STATION_CONFIG: Record<string, { color: string; textColor: string; bgColor: string; icon: React.ReactNode }> = {
  'bar': { 
    color: '#2563eb',      // Azul más oscuro
    textColor: '#1e40af',  // Texto azul oscuro
    bgColor: '#dbeafe',
    icon: <Coffee className="w-6 h-6" />
  },
  'cocina-caliente': { 
    color: '#dc2626',      // Rojo más oscuro
    textColor: '#991b1b',  // Texto rojo oscuro
    bgColor: '#fee2e2',
    icon: <Flame className="w-6 h-6" />
  },
  'cocina-fria': { 
    color: '#0891b2',      // Cyan más oscuro
    textColor: '#155e75',  // Texto cyan oscuro
    bgColor: '#cffafe',
    icon: <Snowflake className="w-6 h-6" />
  },
  'cocina-general': { 
    color: '#7c3aed',      // Violeta más oscuro
    textColor: '#5b21b6',  // Texto violeta oscuro
    bgColor: '#ede9fe',
    icon: <ChefHat className="w-6 h-6" />
  },
  'parrilla': { 
    color: '#ea580c',      // Naranja más oscuro
    textColor: '#c2410c',  // Texto naranja oscuro
    bgColor: '#ffedd5',
    icon: <Beef className="w-6 h-6" />
  },
  'postres': { 
    color: '#db2777',      // Rosa más oscuro
    textColor: '#be185d',  // Texto rosa oscuro
    bgColor: '#fce7f3',
    icon: <Cake className="w-6 h-6" />
  }
}

export function KdsStationFilter({ stations, selectedStationId, onSelectStation }: KdsStationFilterProps) {
  // Ordenar estaciones: activas primero
  const sortedStations = [...stations].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1
    if (!a.isActive && b.isActive) return 1
    return 0
  })

  const isShowingAll = selectedStationId === null

  return (
    <div className="bg-white border-b-2 border-gray-200 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Header del filtro */}
        <div className="flex items-center gap-3 mb-4">
          {/* Título opcional */}
        </div>

        {/* Estaciones en columna única */}
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {/* Botón "Todas las Estaciones" */}
          <button
            onClick={() => onSelectStation(null)}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-xl border-2 font-semibold transition-all
              ${isShowingAll
                ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <LayoutGrid className="w-6 h-6" />
            <div className="flex-1 text-left">
              <span className="block text-lg">Todas las Estaciones</span>
            </div>
            <span className={`
              px-3 py-1 rounded-full text-sm font-bold
              ${isShowingAll ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'}
            `}>
              {stations.reduce((sum, s) => sum + s.pendingCount, 0)}
            </span>
          </button>

          {/* Botones por estación */}
          {sortedStations.map((station) => {
            const config = STATION_CONFIG[station.name.toLowerCase().replace(/\s+/g, '-')] || STATION_CONFIG['cocina-general']
            const isSelected = selectedStationId === station.id
            
            return (
              <button
                key={station.id}
                onClick={() => onSelectStation(station.id)}
                disabled={!station.isActive}
                className={`
                  flex items-center gap-3 px-6 py-4 rounded-xl border-2 font-semibold transition-all
                  ${isSelected
                    ? 'ring-2 ring-offset-2'
                    : ''
                  }
                  ${!station.isActive ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                `}
                style={{
                  borderColor: isSelected ? config.color : '#e5e7eb',
                  backgroundColor: isSelected ? config.bgColor : 'white',
                  color: isSelected ? config.textColor : '#374151',
                  '--tw-ring-color': config.color
                } as React.CSSProperties}
              >
                <div style={{ color: isSelected ? config.color : config.textColor }}>
                  {config.icon}
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-lg font-bold">{station.displayName || station.name}</span>
                </div>
                
                {station.pendingCount > 0 && (
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: config.color }}
                  >
                    {station.pendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
