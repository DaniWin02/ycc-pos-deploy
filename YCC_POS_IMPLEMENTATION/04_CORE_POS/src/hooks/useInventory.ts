import { useState, useCallback } from 'react'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3004').replace(/\/api\/?$/, '');

interface InventoryCheckResult {
  available: boolean
  inStock: boolean
  currentStock: number | null
  requestedQuantity: number
  minStockLevel: number | null
  ingredientsAvailable: boolean
  missingIngredients: string[] | null
  message: string
}

export const useInventory = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAvailability = useCallback(async (
    productId: string,
    quantity: number = 1
  ): Promise<InventoryCheckResult | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_URL}/inventory/check/${productId}?quantity=${quantity}`
      )

      if (!response.ok) {
        throw new Error('Error al verificar disponibilidad')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error verificando inventario:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const consumeInventory = useCallback(async (
    productId: string,
    quantity: number,
    orderId?: string,
    userId?: string
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/inventory/consume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          quantity,
          orderId,
          userId
        })
      })

      if (!response.ok) {
        throw new Error('Error al descontar inventario')
      }

      const data = await response.json()
      return data.success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error descontando inventario:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const getStockAlerts = useCallback(async (resolved: boolean = false) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_URL}/inventory/alerts?resolved=${resolved}`
      )

      if (!response.ok) {
        throw new Error('Error al obtener alertas')
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error obteniendo alertas:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    checkAvailability,
    consumeInventory,
    getStockAlerts,
    loading,
    error
  }
}
