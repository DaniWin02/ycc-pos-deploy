import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { Product, CartItem, CartTotals, PaymentMethod } from '../types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  customerName: string
  paymentMethod: PaymentMethod
  discount: number
  discountType: 'percentage' | 'amount'
  notes: string
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setCustomerName: (name: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setDiscount: (discount: number, type: 'percentage' | 'amount') => void
  setNotes: (notes: string) => void
  toggleCart: () => void
  getTotals: () => CartTotals
  getItemCount: () => number
  completeSale: (splitPaymentsData?: { method: PaymentMethod; amount: number }[]) => Promise<any>
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [], // CRITICAL: items siempre vacío - los items viven en useComandasStore
        isOpen: false,
        customerName: '',
        paymentMethod: 'CASH' as PaymentMethod,
        discount: 0,
        discountType: 'percentage' as const,
        notes: '',

        // CRITICAL: addItem/removeItem/updateQuantity están deshabilitados
        // Los items ahora viven exclusivamente en useComandasStore (addItemToComanda, etc.)
        // Estas funciones se mantienen por compatibilidad pero NO deben usarse para el flujo principal
        addItem: (product: Product, quantity = 1) => {
          console.warn('⚠️ useCartStore.addItem está deprecado. Usa useComandasStore.addItemToComanda');
          // No-op: los items se manejan en comandas
        },

        removeItem: (productId: string) => {
          console.warn('⚠️ useCartStore.removeItem está deprecado. Usa useComandasStore.removeItemFromComanda');
          // No-op: los items se manejan en comandas
        },

        updateQuantity: (productId: string, quantity: number) => {
          console.warn('⚠️ useCartStore.updateQuantity está deprecado. Usa useComandasStore.updateItemQuantity');
          // No-op: los items se manejan en comandas
        },

        clearCart: () => set({ items: [], discount: 0, discountType: 'percentage', notes: '', customerName: '' }), // items siempre [] por seguridad

        setCustomerName: (name) => set({ customerName: name }),
        setPaymentMethod: (method) => set({ paymentMethod: method }),
        setDiscount: (discount, type) => set({ discount, discountType: type }),
        setNotes: (notes) => set({ notes }),
        toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

        getTotals: () => {
          const { items, discount, discountType } = get()
          // En México, los precios ya incluyen IVA
          const total = items.reduce((sum, item) => sum + item.totalPrice, 0)
          const discountAmount = discountType === 'percentage' ? total * (discount / 100) : discount
          const totalAfterDiscount = Math.max(0, total - discountAmount)
          // Desglosar IVA del total (16% incluido)
          const subtotal = totalAfterDiscount / 1.16
          const taxAmount = totalAfterDiscount - subtotal
          return { subtotal, discountAmount, taxAmount, total: totalAfterDiscount, itemCount: items.reduce((s, i) => s + i.quantity, 0) }
        },

        getItemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),

        completeSale: async (splitPaymentsData?: { method: PaymentMethod; amount: number }[]) => {
          const { items, paymentMethod, customerName, notes } = get()
          const totals = get().getTotals()

          try {
            // Asegurar que la URL base no incluya /api
            let apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:3004'
            // Remover /api del final si existe
            apiUrl = apiUrl.replace(/\/api\/?$/, '')
            console.log('🔗 API URL:', apiUrl)

            const requestBody = {
              items: items.map(item => ({
                productId: item.productId,
                name: item.name,
                sku: item.sku,
                price: item.unitPrice,
                quantity: item.quantity,
                stationId: item.stationId,
                stationName: item.stationName
              })),
              customerId: null,
              customerName: customerName || 'Guest',
              totalAmount: totals.total,
              paymentMethod: paymentMethod,
              notes: notes,
              splitPayments: splitPaymentsData && splitPaymentsData.length > 0
                ? splitPaymentsData.map(sp => ({ method: sp.method, amount: sp.amount }))
                : undefined
            }

            console.log('📤 Sending request to:', `${apiUrl}/api/sales`)
            console.log('📤 Request body:', requestBody)

            // Crear un AbortController para timeout de 30 segundos (aumentado de 15s)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)

            const response = await fetch(`${apiUrl}/api/sales`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
              signal: controller.signal
            })

            clearTimeout(timeoutId)

            console.log('📥 Response status:', response.status, response.statusText)
            console.log('📥 Response ok:', response.ok)

            if (!response.ok) {
              const errorText = await response.text()
              console.error('❌ Response text:', errorText)

              let errorData
              try {
                errorData = JSON.parse(errorText)
              } catch {
                errorData = { error: errorText || 'Unknown error' }
              }

              console.error('❌ Error del servidor:', errorData)
              throw new Error(errorData.details || errorData.error || 'Failed to create sale')
            }

            const sale = await response.json()
            console.log('✅ Venta creada en el backend:', sale)

            // Las órdenes se envían automáticamente al KDS vía Socket.io desde el backend
            // No necesitamos crear comandas manualmente aquí

            // Limpiar carrito después de venta exitosa
            get().clearCart()
            console.log('🧹 Cart store limpiado después de venta');

            return sale
          } catch (error: any) {
            console.error('❌ Error al crear venta:', error)
            // Mostrar mensaje más claro para timeout
            if (error.name === 'AbortError') {
              throw new Error('Timeout: La solicitud tardó demasiado. Verifica que el servidor backend esté corriendo en el puerto 3004 y tu conexión de red.')
            }
            // Si es error de red (fetch failed)
            if (error.message && error.message.includes('fetch failed')) {
              throw new Error('Error de conexión: No se pudo conectar al servidor. Verifica que el backend esté corriendo.')
            }
            throw error
          }
        },
      }),
      { 
        name: 'ycc-cart-storage',
        // CRITICAL: No persistir items del carrito - los items viven en comandas.store
        // Solo persistir configuración de pago (paymentMethod, customerName, etc.)
        partialize: (state) => ({
          items: [], // SIEMPRE vacío al rehidratar - nunca restaurar items del carrito legacy
          isOpen: false,
          customerName: '',
          paymentMethod: state.paymentMethod,
          discount: 0,
          discountType: state.discountType,
          notes: ''
        })
      }
    )
  )
)
