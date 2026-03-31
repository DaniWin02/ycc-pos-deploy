/**
 * Servicio para gestión de órdenes desde el API
 * Maneja la comunicación con el backend para el sistema de estados de órdenes
 */

const API_URL = import.meta.env?.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3004'

export interface Order {
  id: string
  folio: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  customerName?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  notes?: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  product?: {
    category?: {
      station?: string
    }
  }
}

export const ordersService = {
  /**
   * Obtener órdenes con filtros opcionales
   */
  async getOrders(status?: string, station?: string, limit: number = 50): Promise<Order[]> {
    try {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (station) params.append('station', station)
      params.append('limit', limit.toString())
      
      const url = `${API_URL}/api/orders?${params}`
      console.log(`📡 Cargando órdenes desde: ${url}`)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const orders = await response.json()
      console.log(`✅ Órdenes cargadas: ${orders.length}`)
      
      return orders
    } catch (error) {
      console.error('❌ Error cargando órdenes:', error)
      throw error
    }
  },

  /**
   * Obtener una orden específica por ID
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      const url = `${API_URL}/api/orders/${orderId}`
      console.log(`📡 Cargando orden: ${url}`)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const order = await response.json()
      console.log(`✅ Orden cargada: ${order.folio}`)
      
      return order
    } catch (error) {
      console.error('❌ Error cargando orden:', error)
      throw error
    }
  },

  /**
   * Cambiar estado de una orden
   */
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const url = `${API_URL}/api/orders/${orderId}/status`
      console.log(`📡 Actualizando orden ${orderId} a estado: ${status}`)
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `HTTP ${response.status}`)
      }
      
      const order = await response.json()
      console.log(`✅ Orden actualizada: ${order.folio} → ${status}`)
      
      return order
    } catch (error) {
      console.error('❌ Error actualizando orden:', error)
      throw error
    }
  },

  /**
   * Cambiar estado de un item específico
   */
  async updateItemStatus(orderId: string, itemId: string, status: string): Promise<OrderItem> {
    try {
      const url = `${API_URL}/api/orders/${orderId}/items/${itemId}/status`
      console.log(`📡 Actualizando item ${itemId} a estado: ${status}`)
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `HTTP ${response.status}`)
      }
      
      const item = await response.json()
      console.log(`✅ Item actualizado: ${itemId} → ${status}`)
      
      return item
    } catch (error) {
      console.error('❌ Error actualizando item:', error)
      throw error
    }
  }
}
