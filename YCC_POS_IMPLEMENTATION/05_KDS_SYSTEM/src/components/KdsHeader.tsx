import React from 'react'
import { Clock, List } from 'lucide-react'
import { useKdsStore } from '../stores/useKdsStore'

interface KdsHeaderProps {
  stationId: string
  pendingCount: number
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected'
}

const stationNames: Record<string, string> = {
  kitchen: 'Cocina',
  bar: 'Bar',
  grill: 'Parrilla',
  dessert: 'Postres'
}

export function KdsHeader({ stationId, pendingCount, connectionStatus }: KdsHeaderProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date())

  // Actualizar tiempo cada segundo
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <header className="bg-kds-header border-b border-kds-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Estación y contador */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <List className="w-6 h-6 text-kds-text" />
            <div>
              <h1 className="text-xl font-bold text-kds-text">
                {stationNames[stationId] || stationId}
              </h1>
              <p className="text-sm text-kds-secondary">
                Estación {stationId}
              </p>
            </div>
          </div>

          <div className="bg-kds-card px-4 py-2 rounded-lg border border-kds-border">
            <p className="text-sm text-kds-secondary">Pendientes</p>
            <p className="text-2xl font-bold text-kds-text">{pendingCount}</p>
          </div>
        </div>

        {/* Reloj y estado */}
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-kds-secondary" />
              <span className="text-2xl font-mono text-kds-text">
                {formatTime(currentTime)}
              </span>
            </div>
            <p className="text-sm text-kds-secondary">
              {currentTime.toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Estado de conexión */}
          <div className="flex items-center space-x-2">
            <div className={`
              w-3 h-3 rounded-full ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500' 
                  : connectionStatus === 'reconnecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500'
              }
            `} />
            <span className="text-sm text-kds-secondary">
              {connectionStatus === 'connected' ? 'Conectado' :
               connectionStatus === 'reconnecting' ? 'Reconectando' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
