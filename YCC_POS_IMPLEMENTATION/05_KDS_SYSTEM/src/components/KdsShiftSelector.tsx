import React, { useState, useEffect } from 'react'
import { Clock, LogOut, User, Calendar, ChevronRight, Plus } from 'lucide-react'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3004').replace(/\/api\/?$/, '');

interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  isActive: boolean
  staffCount: number
  ordersCount: number
}

interface KdsShiftSelectorProps {
  user: { id: string; name: string; role: string }
  onSelectShift: (shift: Shift) => void
  onLogout: () => void
}

export function KdsShiftSelector({ user, onSelectShift, onLogout }: KdsShiftSelectorProps) {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedShift, setSelectedShift] = useState<string>('')

  useEffect(() => {
    // Cargar turnos del API o usar datos mock
    const loadShifts = async () => {
      try {
        // Intentar obtener turnos del API
        const response = await fetch(`${API_URL}/api/shifts?active=true`)
        if (response.ok) {
          const data = await response.json()
          setShifts(data)
        } else {
          // Usar turnos mock si no hay datos
          const mockShifts: Shift[] = [
            {
              id: 'morning',
              name: 'Turno Mañana',
              startTime: '07:00',
              endTime: '15:00',
              isActive: true,
              staffCount: 3,
              ordersCount: 12
            },
            {
              id: 'evening',
              name: 'Turno Tarde',
              startTime: '15:00',
              endTime: '23:00',
              isActive: true,
              staffCount: 5,
              ordersCount: 28
            },
            {
              id: 'night',
              name: 'Turno Noche',
              startTime: '23:00',
              endTime: '07:00',
              isActive: false,
              staffCount: 2,
              ordersCount: 0
            }
          ]
          setShifts(mockShifts.filter(s => s.isActive))
        }
      } catch (error) {
        console.error('Error cargando turnos:', error)
        // Usar turnos mock
        const mockShifts: Shift[] = [
          {
            id: 'morning',
            name: 'Turno Mañana',
            startTime: '07:00',
            endTime: '15:00',
            isActive: true,
            staffCount: 3,
            ordersCount: 12
          },
          {
            id: 'evening',
            name: 'Turno Tarde',
            startTime: '15:00',
            endTime: '23:00',
            isActive: true,
            staffCount: 5,
            ordersCount: 28
          }
        ]
        setShifts(mockShifts)
      } finally {
        setLoading(false)
      }
    }

    loadShifts()
  }, [])

  const handleSelectShift = (shift: Shift) => {
    setSelectedShift(shift.id)
    // Pequeño delay para mostrar selección antes de navegar
    setTimeout(() => {
      onSelectShift(shift)
    }, 300)
  }

  const formatTime = (time?: string) => {
    if (!time) return 'N/A'
    const parts = time.split(':')
    if (parts.length < 2) return time
    const [hours, minutes] = parts
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando turnos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header con info de usuario */}
      <header className="bg-white border-b-2 border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="btn-tablet btn-danger flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-green-100 p-4 rounded-2xl mb-4">
              <Clock className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Selecciona tu Turno
            </h1>
            <p className="text-lg text-gray-600">
              Elige el turno activo en el que trabajarás
            </p>
          </div>

          {/* Grid de turnos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shifts.map((shift) => (
              <button
                key={shift.id}
                onClick={() => handleSelectShift(shift)}
                className={`
                  card-tablet p-6 text-left transition-all
                  ${selectedShift === shift.id 
                    ? 'ring-4 ring-green-500 bg-green-50' 
                    : 'hover:shadow-xl'
                  }
                `}
              >
                {/* Header del turno */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {shift.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-green-500 text-white p-2 rounded-full">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Personal</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {shift.staffCount}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Pedidos</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {shift.ordersCount}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                  <span className="text-sm font-medium text-green-600">
                    {shift.isActive ? '🟢 Turno Activo' : '⚫ Turno Inactivo'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Toca para seleccionar
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Botón para crear nuevo turno (solo admin) */}
          {user.role === 'admin' && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {/* TODO: Crear nuevo turno */}}
                className="btn-tablet btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Nuevo Turno</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
