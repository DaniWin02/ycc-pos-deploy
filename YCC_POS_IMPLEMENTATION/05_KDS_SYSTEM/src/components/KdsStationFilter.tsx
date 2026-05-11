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
    color: '#059669', // Verde Country Club
    textColor: '#047857', // emerald-700
    bgColor: '#d1fae5', // emerald-100
    icon: <Coffee className="w-6 h-6" />
  },
  'cocina-caliente': { 
    color: '#dc2626',
    textColor: '#991b1b',
    bgColor: '#fee2e2',
    icon: <Flame className="w-6 h-6" />
  },
  'cocina-fria': { 
    color: '#0891b2',
    textColor: '#155e75',
    bgColor: '#cffafe',
    icon: <Snowflake className="w-6 h-6" />
  },
  'cocina-general': { 
    color: '#7c3aed',
    textColor: '#5b21b6',
    bgColor: '#ede9fe',
    icon: <ChefHat className="w-6 h-6" />
  },
  'parrilla': { 
    color: '#ea580c',
    textColor: '#c2410c',
    bgColor: '#ffedd5',
    icon: <Beef className="w-6 h-6" />
  },
  'postres': { 
    color: '#db2777',
    textColor: '#be185d',
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
    <div className="border-b-2 px-4 py-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Estaciones en columna única */}
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {/* Botón "Todas las Estaciones" */}
          <button
            onClick={() => onSelectStation(null)}
            className={`
              flex items-center gap-4 px-8 py-6 rounded-2xl border-2 font-black transition-all active:scale-95
              ${isShowingAll
                ? 'shadow-xl scale-[1.02] ring-4 ring-opacity-20 ring-primary'
                : 'opacity-70 hover:opacity-100'
              }
            `}
            style={{
              borderColor: isShowingAll ? 'var(--primary)' : 'var(--border)',
              backgroundColor: isShowingAll ? 'var(--primary)' : 'var(--muted)',
              color: isShowingAll ? 'var(--primary-foreground)' : 'var(--foreground)',
            }}
          >
            <div className={`p-3 rounded-xl ${isShowingAll ? 'bg-white bg-opacity-20' : ''}`} style={{ backgroundColor: isShowingAll ? '' : 'var(--background)' }}>
              <LayoutGrid className="w-8 h-8" />
            </div>
            <div className="flex-1 text-left">
              <span className="block text-xl uppercase tracking-tight">Todas las Estaciones</span>
              <span className="text-xs font-bold opacity-60">VISTA GLOBAL DE COMANDAS</span>
            </div>
            <span className={`
              px-4 py-1.5 rounded-full text-base font-black
              ${isShowingAll ? 'bg-white text-primary' : 'bg-gray-200 text-gray-700'}
            `} style={{ color: isShowingAll ? 'var(--primary)' : '' }}>
              {stations.reduce((sum, s) => sum + s.pendingCount, 0)}
            </span>
          </button>

          <div className="grid grid-cols-1 gap-3">
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
                    flex items-center gap-4 px-6 py-4 rounded-2xl border-2 font-bold transition-all active:scale-95
                    ${isSelected ? 'shadow-lg ring-2 ring-offset-2' : 'hover:border-gray-300'}
                    ${!station.isActive ? 'opacity-30 grayscale cursor-not-allowed' : ''}
                  `}
                  style={{
                    borderColor: isSelected ? config.color : 'var(--border)',
                    backgroundColor: isSelected ? config.bgColor : 'var(--card)',
                    color: isSelected ? config.textColor : 'var(--foreground)',
                    '--tw-ring-color': config.color
                  } as any}
                >
                  <div style={{ color: isSelected ? config.color : config.color }}>
                    {config.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="block text-lg font-black uppercase tracking-tight">{station.displayName || station.name}</span>
                  </div>
                  
                  {station.pendingCount > 0 && (
                    <span 
                      className="px-3 py-1 rounded-lg text-sm font-black text-white shadow-sm"
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
    </div>
  )
}
