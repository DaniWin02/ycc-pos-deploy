import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Monitor, ChefHat } from 'lucide-react'
import { useKdsStore } from '../stores/useKdsStore'

interface Station {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

const stations: Station[] = [
  {
    id: 'kitchen',
    name: 'Cocina',
    icon: <ChefHat className="w-8 h-8" />,
    description: 'Preparación de alimentos principales'
  },
  {
    id: 'bar',
    name: 'Bar',
    icon: <Store className="w-8 h-8" />,
    description: 'Bebidas y cócteles'
  },
  {
    id: 'grill',
    name: 'Parrilla',
    icon: <Monitor className="w-8 h-8" />,
    description: 'Carnes a la parrilla'
  },
  {
    id: 'dessert',
    name: 'Postres',
    icon: <Store className="w-8 h-8" />,
    description: 'Postres y dulces'
  }
]

export function KdsStationSelector() {
  const [selectedStation, setSelectedStation] = useState<string>('')
  const { setStationId, setStoreId, connect } = useKdsStore()
  const navigate = useNavigate()

  const handleStationSelect = (stationId: string) => {
    setSelectedStation(stationId)
    setStationId(stationId)
    setStoreId('store-1')
    connect()
    
    // Navegar a la vista de la estación
    navigate(`/kds/station/${stationId}`)
  }

  return (
    <div className="min-h-screen bg-kds-bg flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-kds-text mb-4">
            YCC Kitchen Display System
          </h1>
          <p className="text-xl text-kds-secondary">
            Selecciona tu estación de trabajo
          </p>
        </div>

        {/* Grid de estaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => handleStationSelect(station.id)}
              className={`
                kds-card p-8 text-left transition-all duration-300
                hover:scale-105 hover:shadow-2xl
                border-2 ${
                  selectedStation === station.id
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-kds-border hover:border-green-500/50'
                }
              `}
            >
              {/* Icono y nombre */}
              <div className="flex items-center mb-4">
                <div className="text-green-500 mr-4">
                  {station.icon}
                </div>
                <h3 className="text-2xl font-bold text-kds-text">
                  {station.name}
                </h3>
              </div>

              {/* Descripción */}
              <p className="text-kds-secondary mb-6">
                {station.description}
              </p>

              {/* Estado */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-kds-secondary">
                  Estación {station.id}
                </span>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-kds-secondary">
            Selecciona una estación para comenzar a recibir órdenes
          </p>
        </div>
      </div>
    </div>
  )
}
