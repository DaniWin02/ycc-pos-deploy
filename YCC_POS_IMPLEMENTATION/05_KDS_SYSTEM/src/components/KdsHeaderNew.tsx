import React from 'react'
import { LogOut, Wifi, WifiOff, Coffee, Flame, Snowflake, ChefHat, Beef, Cake } from 'lucide-react'
import { useKdsStore } from '../stores/useKdsStore'

interface KdsHeaderNewProps {
  onExitStation: () => void
}

const STATION_ICONS: Record<string, React.ReactNode> = {
  'bar': <Coffee className="w-8 h-8" />,
  'cocina-caliente': <Flame className="w-8 h-8" />,
  'cocina-fria': <Snowflake className="w-8 h-8" />,
  'cocina-general': <ChefHat className="w-8 h-8" />,
  'parrilla': <Beef className="w-8 h-8" />,
  'postres': <Cake className="w-8 h-8" />
}

const STATION_COLORS: Record<string, string> = {
  'bar': '#3b82f6',
  'cocina-caliente': '#ef4444',
  'cocina-fria': '#06b6d4',
  'cocina-general': '#8b5cf6',
  'parrilla': '#f97316',
  'postres': '#ec4899'
}

export function KdsHeaderNew({ onExitStation }: KdsHeaderNewProps) {
  const { tickets, connectionStatus } = useKdsStore()
  
  // Obtener nombre de estación desde localStorage
  const stationName = localStorage.getItem('kds_current_station_name') || 'Estación'
  const stationId = localStorage.getItem('kds_current_station') || ''
  
  // Determinar clave de estación para iconos y colores
  const stationKey = stationName.toLowerCase().replace(/\s+/g, '-')
  const stationIcon = STATION_ICONS[stationKey] || <ChefHat className="w-8 h-8" />
  const stationColor = STATION_COLORS[stationKey] || '#16a34a'

  // Contar tickets por estado
  const newCount = tickets.filter(t => t.status === 'NEW').length
  const preparingCount = tickets.filter(t => t.status === 'PREPARING').length
  const readyCount = tickets.filter(t => t.status === 'READY').length

  // Estado de conexión
  const isOnline = connectionStatus === 'connected'

  return (
    <header className="bg-white border-b-4 shadow-lg sticky top-0 z-50" style={{ borderColor: stationColor }}>
      <div className="px-4 md:px-6 py-4">
        {/* Fila principal */}
        <div className="flex items-center justify-between mb-4">
          {/* Nombre de estación con icono */}
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-2xl"
              style={{ backgroundColor: `${stationColor}20` }}
            >
              <div style={{ color: stationColor }}>
                {stationIcon}
              </div>
            </div>
            <div>
              <h1 
                className="text-2xl md:text-4xl font-bold"
                style={{ color: stationColor }}
              >
                {stationName}
              </h1>
              <p className="text-sm md:text-base text-gray-600 font-medium">
                Kitchen Display System
              </p>
            </div>
          </div>

          {/* Botón salir */}
          <button
            onClick={onExitStation}
            className="btn-tablet btn-danger flex items-center gap-2"
            style={{ minHeight: '56px' }}
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline font-semibold">Salir</span>
          </button>
        </div>

        {/* Fila de badges y estado */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Badges de conteo */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Nuevos */}
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border-2 border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Nuevos:</span>
              <span className="text-lg font-bold text-blue-600">{newCount}</span>
            </div>

            {/* Preparando */}
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border-2 border-amber-200">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700">Preparando:</span>
              <span className="text-lg font-bold text-amber-600">{preparingCount}</span>
            </div>

            {/* Listos */}
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border-2 border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Listos:</span>
              <span className="text-lg font-bold text-green-600">{readyCount}</span>
            </div>
          </div>

          {/* Indicador de conexión */}
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-xl border-2
            ${isOnline 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
            }
          `}>
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-600" />
                <span className="text-sm font-semibold text-red-700">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
