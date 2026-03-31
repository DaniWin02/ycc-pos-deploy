import React, { useState, useEffect } from 'react'
import { ChefHat, Delete, LogIn, User } from 'lucide-react'

interface KdsLoginProps {
  onLogin: (user: { id: string; name: string; role: string }) => void
}

export function KdsLogin({ onLogin }: KdsLoginProps) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar usuarios del sistema
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    // Por ahora usamos usuarios mock o del API
    // En producción esto vendría de /api/users
    const mockUsers = [
      { id: 'chef1', name: 'Chef Principal', pin: '1234', role: 'chef' },
      { id: 'cocina1', name: 'Cocinero 1', pin: '1111', role: 'chef' },
      { id: 'bar1', name: 'Barman', pin: '2222', role: 'bartender' },
      { id: 'admin1', name: 'Administrador', pin: '9999', role: 'admin' }
    ]
    setUsers(mockUsers)
  }, [])

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit)
      setError('')
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
    setError('')
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setError('Ingresa 4 dígitos')
      return
    }

    setLoading(true)
    setError('')

    // Buscar usuario por PIN
    const user = users.find(u => u.pin === pin)
    
    if (user) {
      console.log('✅ Login exitoso:', user.name)
      onLogin({ id: user.id, name: user.name, role: user.role })
    } else {
      setError('PIN incorrecto')
      setPin('')
    }

    setLoading(false)
  }

  // Auto-login cuando el PIN tiene 4 dígitos
  useEffect(() => {
    if (pin.length === 4) {
      handleLogin()
    }
  }, [pin])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-lg inline-block mb-4">
            <ChefHat className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kitchen Display System
          </h1>
          <p className="text-lg text-gray-600">
            YCC Country Club
          </p>
        </div>

        {/* PIN Display */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-800">
              Ingresa tu PIN
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              PIN de 4 dígitos
            </p>
          </div>

          {/* PIN Dots */}
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all ${
                  i < pin.length
                    ? 'bg-green-600 scale-110'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-center mb-4 font-medium">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Verificando...</p>
            </div>
          )}

          {/* PIN Pad */}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePinPress(digit)}
                disabled={loading}
                className="btn-tablet btn-secondary h-20 text-2xl font-bold"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={handleClear}
              disabled={loading || pin.length === 0}
              className="btn-tablet bg-gray-200 text-gray-900 h-20 text-lg font-semibold disabled:opacity-50 hover:bg-gray-300"
            >
              Borrar
            </button>
            <button
              onClick={() => handlePinPress('0')}
              disabled={loading}
              className="btn-tablet btn-secondary h-20 text-2xl font-bold"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="btn-tablet bg-gray-200 text-gray-900 h-20 flex items-center justify-center disabled:opacity-50 hover:bg-gray-300"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            PINs de prueba: 1234, 1111, 2222, 9999
          </p>
        </div>
      </div>
    </div>
  )
}
