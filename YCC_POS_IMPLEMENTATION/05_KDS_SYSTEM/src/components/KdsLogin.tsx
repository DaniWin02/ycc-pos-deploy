import { useState, useEffect, useRef } from 'react'
import { ChefHat, Delete, User, Lock } from 'lucide-react'
import { useResponsive } from '../hooks/useResponsive'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3004').replace(/\/api\/?$/, '');

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
        const response = await fetch(`${API_URL}/api/users`)
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
        socketRef.current = io(API_URL, { 
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
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-500" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="p-4 rounded-3xl shadow-xl inline-block mb-4" style={{ backgroundColor: 'var(--card)', border: '2px solid var(--border)' }}>
            <ChefHat className="w-12 h-12 sm:w-16 sm:h-16" style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1" style={{ color: 'var(--foreground)' }}>
            Kitchen Display
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest opacity-40" style={{ color: 'var(--foreground)' }}>
            YCC Country Club
          </p>
        </div>

        {/* PIN Entry Card */}
        <div className="rounded-3xl shadow-2xl p-6 sm:p-8 border-2" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="text-center mb-8">
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-12 border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300`}
                  style={{ 
                    borderRadius: 'var(--radius-base)',
                    borderColor: i < pin.length ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: i < pin.length ? 'var(--accent)' : 'transparent',
                    color: i < pin.length ? 'var(--primary)' : 'var(--muted-foreground)'
                  }}
                >
                   {i < pin.length ? '•' : ''}
                </div>
              ))}
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
              Ingresar PIN
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2 rounded-xl text-center mb-4 font-bold text-xs" style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" style={{ borderColor: 'var(--primary)' }}></div>
            </div>
          )}

          {/* PIN Pad */}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePinPress(digit)}
                disabled={loading}
                className="h-16 text-2xl font-black transition-all active:scale-95 shadow-sm border-2"
                style={{ 
                  backgroundColor: 'var(--muted)', 
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-base)'
                }}
              >
                {digit}
              </button>
            ))}
            <button
              onClick={handleDelete}
              disabled={loading || pin.length === 0}
              className="h-16 flex items-center justify-center transition-all active:scale-95 border-2"
              style={{ 
                backgroundColor: 'var(--muted)', 
                color: 'var(--destructive)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-base)'
              }}
            >
              <Delete className="w-6 h-6" />
            </button>
            <button
              onClick={() => handlePinPress('0')}
              disabled={loading}
              className="h-16 text-2xl font-black transition-all active:scale-95 border-2"
              style={{ 
                backgroundColor: 'var(--muted)', 
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-base)'
              }}
            >
              0
            </button>
            <button
              onClick={handleLogin}
              disabled={loading || pin.length < 4}
              className="h-16 flex items-center justify-center transition-all active:scale-95 shadow-lg"
              style={{ 
                backgroundColor: 'var(--primary)', 
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius-base)',
                opacity: pin.length === 4 ? 1 : 0.5
              }}
            >
              <Lock className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center opacity-40">
           <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>
            Turno Seguro • YCC KDS System
          </p>
        </div>
      </div>
    </div>
  )
}
