import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../../../04_CORE_POS/src/stores/auth.store'

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useAuthStore.getState().logout()
  })

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'CASHIER'
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const store = useAuthStore.getState()
      
      await store.login('test@example.com', 'password123')

      expect(store.user).toEqual(mockResponse.user)
      expect(store.token).toBe(mockResponse.token)
      expect(store.refreshToken).toBe(mockResponse.refreshToken)
      expect(store.isAuthenticated).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle login failure with invalid credentials', async () => {
      const mockResponse = {
        error: 'Invalid credentials'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockResponse
      })

      const store = useAuthStore.getState()
      
      await store.login('test@example.com', 'wrongpassword')

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Invalid credentials')
    })

    it('should handle network error during login', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const store = useAuthStore.getState()
      
      await store.login('test@example.com', 'password123')

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Network error')
    })

    it('should set loading state during login', async () => {
      ;(fetch as any).mockImplementationOnce(() => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'CASHIER' },
            token: 'mock-token',
            refreshToken: 'mock-refresh-token'
          })
        }), 100)
      ))

      const store = useAuthStore.getState()
      
      const loginPromise = store.login('test@example.com', 'password123')
      
      expect(store.isLoading).toBe(true)
      
      await loginPromise
      
      expect(store.isLoading).toBe(false)
    })
  })

  describe('Logout', () => {
    it('should clear auth state on logout', async () => {
      // First login
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'CASHIER'
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const store = useAuthStore.getState()
      await store.login('test@example.com', 'password123')

      // Then logout
      store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should remove tokens from localStorage on logout', () => {
      const store = useAuthStore.getState()
      
      // Set some tokens first
      store.token = 'mock-token'
      store.refreshToken = 'mock-refresh-token'
      
      store.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth-storage')
    })
  })

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const store = useAuthStore.getState()
      
      // Set initial tokens
      store.token = 'old-token'
      store.refreshToken = 'old-refresh-token'
      
      await store.refreshToken()

      expect(store.token).toBe('new-jwt-token')
      expect(store.refreshToken).toBe('new-refresh-token')
      expect(store.error).toBeNull()
    })

    it('should handle token refresh failure', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid refresh token' })
      })

      const store = useAuthStore.getState()
      
      // Set initial tokens
      store.token = 'old-token'
      store.refreshToken = 'old-refresh-token'
      
      await store.refreshToken()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.error).toBe('Invalid refresh token')
    })

    it('should not refresh if no refresh token', async () => {
      const store = useAuthStore.getState()
      
      await store.refreshToken()

      expect(fetch).not.toHaveBeenCalled()
      expect(store.error).toBe('No refresh token available')
    })
  })

  describe('User Role Check', () => {
    it('should return true for correct role', () => {
      const store = useAuthStore.getState()
      
      store.user = { id: '1', email: 'test@example.com', name: 'Test User', role: 'CASHIER' }
      
      expect(store.hasRole('CASHIER')).toBe(true)
      expect(store.hasRole('ADMIN')).toBe(false)
    })

    it('should return false when user is null', () => {
      const store = useAuthStore.getState()
      
      expect(store.hasRole('CASHIER')).toBe(false)
    })

    it('should check multiple roles', () => {
      const store = useAuthStore.getState()
      
      store.user = { id: '1', email: 'test@example.com', name: 'Test User', role: 'ADMIN' }
      
      expect(store.hasRole(['ADMIN', 'MANAGER'])).toBe(true)
      expect(store.hasRole(['CASHIER', 'MANAGER'])).toBe(false)
    })
  })

  describe('Persistence', () => {
    it('should save auth state to localStorage', () => {
      const store = useAuthStore.getState()
      
      const authData = {
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'CASHIER' },
        token: 'mock-token',
        refreshToken: 'mock-refresh-token'
      }
      
      store.user = authData.user
      store.token = authData.token
      store.refreshToken = authData.refreshToken
      
      // Simulate the persist middleware
      const persistedData = JSON.stringify({
        state: {
          user: authData.user,
          token: authData.token,
          refreshToken: authData.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }
      })
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-storage', persistedData)
    })

    it('should load auth state from localStorage on initialization', () => {
      const authData = {
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'CASHIER' },
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ state: authData }))
      
      // Re-initialize store (this would happen on app start)
      const store = useAuthStore.getState()
      
      expect(store.user).toEqual(authData.user)
      expect(store.token).toBe(authData.token)
      expect(store.refreshToken).toBe(authData.refreshToken)
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should clear error after successful operation', async () => {
      const store = useAuthStore.getState()
      
      // Set an error
      store.error = 'Previous error'
      
      // Successful login
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'CASHIER'
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })
      
      await store.login('test@example.com', 'password123')
      
      expect(store.error).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      })

      const store = useAuthStore.getState()
      
      await store.login('test@example.com', 'password123')
      
      expect(store.error).toBe('Internal server error')
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Loading States', () => {
    it('should set loading state during async operations', async () => {
      ;(fetch as any).mockImplementationOnce(() => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'CASHIER' },
            token: 'mock-token',
            refreshToken: 'mock-refresh-token'
          })
        }), 100)
      ))

      const store = useAuthStore.getState()
      
      const loginPromise = store.login('test@example.com', 'password123')
      
      expect(store.isLoading).toBe(true)
      
      await loginPromise
      
      expect(store.isLoading).toBe(false)
    })

    it('should reset loading state on error', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const store = useAuthStore.getState()
      
      await store.login('test@example.com', 'password123')
      
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe('Network error')
    })
  })

  describe('Token Validation', () => {
    it('should validate token format', () => {
      const store = useAuthStore.getState()
      
      // Valid JWT token
      store.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      expect(store.isTokenValid()).toBe(true)
      
      // Invalid token
      store.token = 'invalid-token'
      expect(store.isTokenValid()).toBe(false)
      
      // Empty token
      store.token = ''
      expect(store.isTokenValid()).toBe(false)
    })

    it('should check if token is expired', () => {
      const store = useAuthStore.getState()
      
      // Expired token (past timestamp)
      store.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid'
      expect(store.isTokenExpired()).toBe(true)
      
      // Valid token (future timestamp)
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      store.token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOi${futureTimestamp}.invalid`
      expect(store.isTokenExpired()).toBe(false)
    })
  })

  describe('User Profile', () => {
    it('should update user profile', () => {
      const store = useAuthStore.getState()
      
      const initialUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'CASHIER' }
      store.user = initialUser
      
      const updatedUser = { ...initialUser, name: 'Updated Name' }
      store.updateProfile(updatedUser)
      
      expect(store.user).toEqual(updatedUser)
    })

    it('should not update profile if user is not authenticated', () => {
      const store = useAuthStore.getState()
      
      store.updateProfile({ id: '1', email: 'test@example.com', name: 'Test User', role: 'CASHIER' })
      
      expect(store.user).toBeNull()
    })
  })
})
