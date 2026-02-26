import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useCartStore } from '../stores/cart.store'
import { Product } from '../types'

describe('Cart Store', () => {
  beforeEach(() => {
    // Clear store before each test
    useCartStore.getState().clearCart()
  })

  afterEach(() => {
    // Clear store after each test
    useCartStore.getState().clearCart()
  })

  describe('addItem', () => {
    it('should add a new item to cart', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 2)

      expect(store.items).toHaveLength(1)
      expect(store.items[0]).toMatchObject({
        productId: '1',
        name: 'Test Product',
        unitPrice: 10.99,
        quantity: 2,
        totalPrice: 21.98,
        category: 'FOOD',
        sku: 'TEST-001'
      })
    })

    it('should update quantity if item already exists', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 2)
      store.addItem(product, 3)

      expect(store.items).toHaveLength(1)
      expect(store.items[0].quantity).toBe(5)
      expect(store.items[0].totalPrice).toBe(54.95)
    })

    it('should add item with modifiers', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }
      const modifiers = [{ id: 'mod1', name: 'Extra Cheese', price: 2.00 }]

      store.addItem(product, 1, modifiers)

      expect(store.items[0].modifiers).toEqual(modifiers)
      expect(store.items[0].totalPrice).toBe(12.99)
    })
  })

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 2)
      expect(store.items).toHaveLength(1)

      store.removeItem('1')
      expect(store.items).toHaveLength(0)
    })

    it('should not affect other items when removing one', () => {
      const store = useCartStore.getState()
      const product1: Product = {
        id: '1',
        name: 'Product 1',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }
      const product2: Product = {
        id: '2',
        name: 'Product 2',
        price: 15.99,
        category: 'BEVERAGE',
        sku: 'TEST-002',
        stock: 50,
        isActive: true
      }

      store.addItem(product1, 2)
      store.addItem(product2, 1)
      expect(store.items).toHaveLength(2)

      store.removeItem('1')
      expect(store.items).toHaveLength(1)
      expect(store.items[0].productId).toBe('2')
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 2)
      expect(store.items[0].quantity).toBe(2)

      store.updateQuantity('1', 5)
      expect(store.items[0].quantity).toBe(5)
      expect(store.items[0].totalPrice).toBe(54.95)
    })

    it('should remove item if quantity is 0', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 2)
      expect(store.items).toHaveLength(1)

      store.updateQuantity('1', 0)
      expect(store.items).toHaveLength(0)
    })

    it('should remove item if quantity is negative', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 2)
      expect(store.items).toHaveLength(1)

      store.updateQuantity('1', -1)
      expect(store.items).toHaveLength(0)
    })
  })

  describe('updateModifiers', () => {
    it('should update item modifiers', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }
      const modifiers1 = [{ id: 'mod1', name: 'Extra Cheese', price: 2.00 }]
      const modifiers2 = [{ id: 'mod2', name: 'Bacon', price: 3.00 }]

      store.addItem(product, 1, modifiers1)
      expect(store.items[0].modifiers).toEqual(modifiers1)
      expect(store.items[0].totalPrice).toBe(12.99)

      store.updateModifiers('1', modifiers2)
      expect(store.items[0].modifiers).toEqual(modifiers2)
      expect(store.items[0].totalPrice).toBe(13.99)
    })
  })

  describe('clearCart', () => {
    it('should clear all items and reset discount', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 2)
      store.setDiscount(10, 'percentage')
      store.setNotes('Test notes')

      expect(store.items).toHaveLength(1)
      expect(store.discount).toBe(10)
      expect(store.notes).toBe('Test notes')

      store.clearCart()

      expect(store.items).toHaveLength(0)
      expect(store.discount).toBe(0)
      expect(store.discountType).toBe('percentage')
      expect(store.notes).toBe('')
    })
  })

  describe('setCustomer', () => {
    it('should update customer information', () => {
      const store = useCartStore.getState()

      store.setCustomer({
        name: 'John Doe',
        phone: '555-1234',
        email: 'john@example.com'
      })

      expect(store.customer).toMatchObject({
        name: 'John Doe',
        phone: '555-1234',
        email: 'john@example.com'
      })
    })

    it('should partially update customer information', () => {
      const store = useCartStore.getState()

      store.setCustomer({ name: 'John Doe' })
      expect(store.customer.name).toBe('John Doe')

      store.setCustomer({ phone: '555-1234' })
      expect(store.customer.name).toBe('John Doe')
      expect(store.customer.phone).toBe('555-1234')
    })
  })

  describe('setPaymentMethod', () => {
    it('should set payment method', () => {
      const store = useCartStore.getState()

      store.setPaymentMethod('CARD')
      expect(store.paymentMethod).toBe('CARD')

      store.setPaymentMethod('CASH')
      expect(store.paymentMethod).toBe('CASH')
    })
  })

  describe('setDiscount', () => {
    it('should set percentage discount', () => {
      const store = useCartStore.getState()

      store.setDiscount(10, 'percentage')
      expect(store.discount).toBe(10)
      expect(store.discountType).toBe('percentage')
    })

    it('should set amount discount', () => {
      const store = useCartStore.getState()

      store.setDiscount(5.00, 'amount')
      expect(store.discount).toBe(5.00)
      expect(store.discountType).toBe('amount')
    })
  })

  describe('getTotals', () => {
    it('should calculate totals correctly without discount', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.00,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 2)
      store.addItem(product, 1)

      const totals = store.getTotals()

      expect(totals).toMatchObject({
        subtotal: 30.00,
        discountAmount: 0,
        taxAmount: 4.80,
        total: 34.80,
        itemCount: 3
      })
    })

    it('should calculate totals with percentage discount', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100.00,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 1)
      store.setDiscount(10, 'percentage')

      const totals = store.getTotals()

      expect(totals).toMatchObject({
        subtotal: 100.00,
        discountAmount: 10.00,
        taxAmount: 14.40,
        total: 104.40,
        itemCount: 1
      })
    })

    it('should calculate totals with amount discount', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 100.00,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 1)
      store.setDiscount(15.00, 'amount')

      const totals = store.getTotals()

      expect(totals).toMatchObject({
        subtotal: 100.00,
        discountAmount: 15.00,
        taxAmount: 13.60,
        total: 98.60,
        itemCount: 1
      })
    })

    it('should handle discount larger than subtotal', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.00,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 1)
      store.setDiscount(200.00, 'amount')

      const totals = store.getTotals()

      expect(totals.total).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getItemCount', () => {
    it('should return total item count', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      expect(store.getItemCount()).toBe(0)

      store.addItem(product, 2)
      expect(store.getItemCount()).toBe(2)

      store.addItem(product, 3)
      expect(store.getItemCount()).toBe(5)
    })
  })

  describe('getItemQuantity', () => {
    it('should return quantity for specific item', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      expect(store.getItemQuantity('1')).toBe(0)

      store.addItem(product, 3)
      expect(store.getItemQuantity('1')).toBe(3)

      store.updateQuantity('1', 5)
      expect(store.getItemQuantity('1')).toBe(5)
    })

    it('should return 0 for non-existent item', () => {
      const store = useCartStore.getState()

      expect(store.getItemQuantity('non-existent')).toBe(0)
    })
  })

  describe('hasItem', () => {
    it('should return true if item exists in cart', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      expect(store.hasItem('1')).toBe(false)

      store.addItem(product, 1)
      expect(store.hasItem('1')).toBe(true)
    })

    it('should return false if item does not exist in cart', () => {
      const store = useCartStore.getState()

      expect(store.hasItem('non-existent')).toBe(false)
    })
  })

  describe('toggleCart', () => {
    it('should toggle cart open state', () => {
      const store = useCartStore.getState()

      expect(store.isOpen).toBe(false)

      store.toggleCart()
      expect(store.isOpen).toBe(true)

      store.toggleCart()
      expect(store.isOpen).toBe(false)
    })
  })

  describe('persist functionality', () => {
    it('should persist cart state to localStorage', () => {
      const store = useCartStore.getState()
      const product: Product = {
        id: '1',
        name: 'Test Product',
        price: 10.99,
        category: 'FOOD',
        sku: 'TEST-001',
        stock: 100,
        isActive: true
      }

      store.addItem(product, 2)
      store.setCustomer({ name: 'John Doe' })
      store.setPaymentMethod('CARD')
      store.setDiscount(5, 'percentage')
      store.setNotes('Test notes')

      // Check if data is in localStorage
      const storedData = localStorage.getItem('cart-storage')
      expect(storedData).toBeTruthy()

      const parsedData = JSON.parse(storedData!)
      expect(parsedData.state).toMatchObject({
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: '1',
            quantity: 2
          })
        ]),
        customer: {
          name: 'John Doe'
        },
        paymentMethod: 'CARD',
        discount: 5,
        discountType: 'percentage',
        notes: 'Test notes'
      })
    })
  })
})
