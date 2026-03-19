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
  completeSale: () => Promise<any>
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,
        customerName: '',
        paymentMethod: 'CASH' as PaymentMethod,
        discount: 0,
        discountType: 'percentage' as const,
        notes: '',

        addItem: (product: Product, quantity = 1) => {
          set((state) => {
            const existing = state.items.findIndex(i => i.productId === product.id)
            const newItems = [...state.items]
            if (existing >= 0) {
              const item = newItems[existing]
              const newQty = item.quantity + quantity
              newItems[existing] = { ...item, quantity: newQty, totalPrice: item.unitPrice * newQty }
            } else {
              newItems.push({
                productId: product.id,
                name: product.name,
                sku: product.sku,
                unitPrice: product.price,
                quantity,
                totalPrice: product.price * quantity,
                categoryName: product.categoryName
              })
            }
            return { items: newItems }
          })
        },

        removeItem: (productId: string) => {
          set((state) => ({ items: state.items.filter(i => i.productId !== productId) }))
        },

        updateQuantity: (productId: string, quantity: number) => {
          set((state) => {
            if (quantity <= 0) return { items: state.items.filter(i => i.productId !== productId) }
            return {
              items: state.items.map(i =>
                i.productId === productId ? { ...i, quantity, totalPrice: i.unitPrice * quantity } : i
              )
            }
          })
        },

        clearCart: () => set({ items: [], discount: 0, discountType: 'percentage', notes: '', customerName: '' }),

        setCustomerName: (name) => set({ customerName: name }),
        setPaymentMethod: (method) => set({ paymentMethod: method }),
        setDiscount: (discount, type) => set({ discount, discountType: type }),
        setNotes: (notes) => set({ notes }),
        toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

        getTotals: () => {
          const { items, discount, discountType } = get()
          const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
          const discountAmount = discountType === 'percentage' ? subtotal * (discount / 100) : discount
          const taxableAmount = Math.max(0, subtotal - discountAmount)
          const taxAmount = taxableAmount * 0.16
          const total = taxableAmount + taxAmount
          return { subtotal, discountAmount, taxAmount, total, itemCount: items.reduce((s, i) => s + i.quantity, 0) }
        },

        getItemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),

        completeSale: async () => {
          const { items, paymentMethod, customerName, notes } = get()
          const totals = get().getTotals()
          
          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3004';
            const response = await fetch(`${apiUrl}/api/sales`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: items.map(item => ({
                  productId: item.productId,
                  name: item.name,
                  sku: item.sku,
                  price: item.unitPrice,
                  quantity: item.quantity
                })),
                customerId: null,
                customerName: customerName || 'Guest',
                totalAmount: totals.total,
                paymentMethod: paymentMethod,
                notes: notes
              })
            })

            if (!response.ok) {
              throw new Error('Failed to create sale')
            }

            const sale = await response.json()
            console.log('✅ Venta creada en el backend:', sale)
            
            // Limpiar carrito después de venta exitosa
            get().clearCart()
            
            return sale
          } catch (error) {
            console.error('❌ Error al crear venta:', error)
            throw error
          }
        },
      }),
      { name: 'ycc-cart-storage' }
    )
  )
)
