import { useState, useCallback, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
  avatar?: string
  isActive: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar token y usuario del localStorage al iniciar
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setAuthState({
          user,
          token,
          isAuthenticated: true
        })
      } catch (err) {
        console.error('Error parsing user data:', err)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3004/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      const data = await response.json()

      // Guardar en localStorage
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))

      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true
      })

      return { success: true, user: data.user }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false
    })
  }, [])

  const verifyToken = useCallback(async () => {
    const token = authState.token || localStorage.getItem('auth_token')

    if (!token) {
      return false
    }

    try {
      const response = await fetch('http://localhost:3004/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        logout()
        return false
      }

      const data = await response.json()
      return data.valid
    } catch (err) {
      console.error('Error verifying token:', err)
      logout()
      return false
    }
  }, [authState.token, logout])

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
    verifyToken,
    loading,
    error
  }
}
