import { useState, useEffect, useRef } from 'react'
import { ChefHat, Delete, User } from 'lucide-react'
import { useResponsive } from '../hooks/useResponsive'

interface KdsLoginProps {
  onLogin: (user: { id: string; name: string; role: string }) => void
}

export function KdsLogin({ onLogin }: KdsLoginProps) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { isMobile } = useResponsive()
  
  // Socket and heartbeat refs
  const socketRef = useRef<any>(null)
  const heartbeatIntervalRef = useRef<any>(null)
  const currentUserRef = useRef<any>(null)

  // Cargar usuarios del sistema
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    // Cargar usuarios desde la API que tienen acceso a KDS
    const loadUsers = async () => {
      try {
        const response = await fetch('http://localhost:3004/api/users')
        if (response.ok) {
          const data = await response.json()
          // Filtrar solo usuarios que pueden acceder al KDS
          const kdsUsers = data.filter((u: any) => u.canAccessKds && u.pin)
          
          // Si no hay usuarios o no hay admin, agregar admin universal
          const hasAdmin = kdsUsers.some((u: any) => u.pin === '0000')
          if (!hasAdmin) {
            kdsUsers.push({
              id: 'admin-universal',
              name: 'Administrador',
              pin: '0000',
              role: 'ADMIN'
            })
          }
          
          setUsers(kdsUsers.map((u: any) => ({
            id: u.id,
            name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username,
            pin: u.pin,
            role: u.role?.toLowerCase() || 'chef'
          })))
        } else {
          // Fallback a usuarios básicos incluyendo admin universal
          setUsers([
            { id: 'admin-universal', name: 'Administrador', pin: '0000', role: 'admin' },
            { id: 'chef-main', name: 'Chef Principal', pin: '1111', role: 'chef' },
            { id: 'cocinero-main', name: 'Cocinero', pin: '2222', role: 'chef' }
          ])
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error)
        // Fallback con admin universal
        setUsers([
          { id: 'admin-universal', name: 'Administrador', pin: '0000', role: 'admin' },
          { id: 'chef-main', name: 'Chef Principal', pin: '1111', role: 'chef' }
        ])
      }
    }
    
    loadUsers()
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
      currentUserRef.current = user
      
      // Reportar actividad al Admin Panel
      try {
        const { io } = await import('socket.io-client')
        socketRef.current = io('http://localhost:3004', { 
          transports: ['polling', 'websocket'],
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        })
        
        socketRef.current.emit('user:login', {
          userId: user.id,
          username: user.name,
          firstName: user.name.split(' ')[0] || user.name,
          lastName: user.name.split(' ')[1] || '',
          role: user.role.toUpperCase(),
          module: 'KDS'
        })
        console.log('📡 Actividad de usuario KDS reportada al Admin Panel')
        
        // Enviar heartbeat cada 30 segundos para mantener estado online
        heartbeatIntervalRef.current = setInterval(() => {
          if (socketRef.current && currentUserRef.current) {
            socketRef.current.emit('user:heartbeat', { userId: currentUserRef.current.id })
            console.log('💓 KDS Heartbeat enviado para usuario:', currentUserRef.current.id)
          }
        }, 30000)
        
      } catch (error) {
        console.error('Error reportando actividad KDS:', error)
      }
      
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

  // Limpiar socket y heartbeat al desmontar
  useEffect(() => {
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div className="kds-login-container">
      <div className="kds-login-card">
        {/* Header */}
        <div className="text-center mb-fluid-md">
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-fluid-md rounded-3xl shadow-lg inline-block mb-fluid-sm">
            <ChefHat className="w-16 h-16 sm:w-20 sm:h-20 text-green-600" />
          </div>
          <h1 className="text-fluid-2xl sm:text-fluid-3xl font-bold text-gray-900 mb-2">
            Kitchen Display
          </h1>
          <p className="text-fluid-base text-gray-600">
            YCC Country Club
          </p>
        </div>

        {/* PIN Display */}
        <div className="bg-white rounded-3xl shadow-lg p-fluid-lg mb-fluid-md">
          <div className="text-center mb-fluid-md">
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
            <h2 className="text-fluid-lg font-bold text-gray-800">
              Ingresa tu PIN
            </h2>
            <p className="text-fluid-sm text-gray-500 mt-1">
              PIN de 4 dígitos
            </p>
          </div>

          {/* PIN Dots */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-fluid-md">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all ${
                  i < pin.length
                    ? 'bg-green-600 scale-110 shadow-lg'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 px-fluid-sm py-fluid-xs rounded-xl text-center mb-fluid-sm font-medium text-fluid-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center mb-fluid-sm">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-fluid-xs text-gray-500 mt-2">Verificando...</p>
            </div>
          )}

          {/* PIN Pad */}
          <div className="grid grid-cols-3 gap-fluid-sm">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePinPress(digit)}
                disabled={loading}
                className="kds-touch-comfortable bg-gray-100 hover:bg-gray-200 active:bg-green-100 active:scale-95 text-gray-900 rounded-xl text-fluid-2xl font-bold transition-all duration-150 shadow-md"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => handlePinPress('0')}
              disabled={loading}
              className="kds-touch-comfortable col-span-2 bg-gray-100 hover:bg-gray-200 active:bg-green-100 active:scale-95 text-gray-900 rounded-xl text-fluid-2xl font-bold transition-all duration-150 shadow-md"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="kds-touch-comfortable bg-gray-200 text-gray-900 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-gray-300 active:scale-95 transition-all"
            >
              <Delete className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-fluid-xs text-gray-500">
            PINs: 1234, 1111, 2222, 9999
          </p>
        </div>
      </div>
    </div>
  )
}
