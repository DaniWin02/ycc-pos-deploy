import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartPanel } from '../../../04_CORE_POS/src/components/CartPanel'
import { useCartStore } from '../../../04_CORE_POS/src/stores/cart.store'
import { Product } from '../../../04_CORE_POS/src/types'

// Mock the cart store
vi.mock('../../../04_CORE_POS/src/stores/cart.store')

describe('CartPanel Component', () => {
  const mockUseCartStore = vi.mocked(useCartStore)

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    mockUseCartStore.mockReturnValue({
      items: [],
      isOpen: false,
      customer: null,
      paymentMethod: 'CASH',
      discount: 0,
      discountType: 'percentage',
      notes: '',
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      updateModifiers: vi.fn(),
      clearCart: vi.fn(),
      setCustomer: vi.fn(),
      setPaymentMethod: vi.fn(),
      setDiscount: vi.fn(),
      setNotes: vi.fn(),
      getTotals: vi.fn().mockReturnValue({
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        total: 0,
        itemCount: 0
      }),
      getItemCount: vi.fn().mockReturnValue(0),
      getItemQuantity: vi.fn().mockReturnValue(0),
      hasItem: vi.fn().mockReturnValue(false),
      toggleCart: vi.fn()
    })
  })

  describe('Rendering', () => {
    it('should render cart panel when open', () => {
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true
      })

      render(<CartPanel />)
      
      expect(screen.getByTestId('cart-panel')).toBeInTheDocument()
      expect(screen.getByTestId('cart-header')).toBeInTheDocument()
      expect(screen.getByTestId('cart-items')).toBeInTheDocument()
      expect(screen.getByTestId('cart-footer')).toBeInTheDocument()
    })

    it('should not render cart panel when closed', () => {
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: false
      })

      render(<CartPanel />)
      
      expect(screen.queryByTestId('cart-panel')).not.toBeInTheDocument()
    })

    it('should display empty cart message when no items', () => {
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: [],
        getItemCount: vi.fn().mockReturnValue(0)
      })

      render(<CartPanel />)
      
      expect(screen.getByTestId('cart-empty')).toBeInTheDocument()
      expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    })

    it('should display cart items when present', () => {
      const mockItems = [
        {
          id: '1',
          productId: 'product-1',
          name: 'Hamburguesa',
          unitPrice: 12.99,
          quantity: 2,
          totalPrice: 25.98,
          category: 'FOOD',
          sku: 'BURG-001',
          modifiers: []
        }
      ]

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: mockItems,
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartPanel />)
      
      expect(screen.getByTestId('cart-item-1')).toBeInTheDocument()
      expect(screen.getByText('Hamburguesa')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('$25.98')).toBeInTheDocument()
    })
  })

  describe('Item Management', () => {
    it('should call removeItem when remove button is clicked', async () => {
      const user = userEvent.setup()
      const mockRemoveItem = vi.fn()
      
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: [
          {
            id: '1',
            productId: 'product-1',
            name: 'Hamburguesa',
            unitPrice: 12.99,
            quantity: 2,
            totalPrice: 25.98,
            category: 'FOOD',
            sku: 'BURG-001',
            modifiers: []
          }
        ],
        removeItem: mockRemoveItem
      })

      render(<CartPanel />)
      
      const removeButton = screen.getByTestId('remove-item-1')
      await user.click(removeButton)
      
      expect(mockRemoveItem).toHaveBeenCalledWith('product-1')
    })

    it('should call updateQuantity when quantity is changed', async () => {
      const user = userEvent.setup()
      const mockUpdateQuantity = vi.fn()
      
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: [
          {
            id: '1',
            productId: 'product-1',
            name: 'Hamburguesa',
            unitPrice: 12.99,
            quantity: 2,
            totalPrice: 25.98,
            category: 'FOOD',
            sku: 'BURG-001',
            modifiers: []
          }
        ],
        updateQuantity: mockUpdateQuantity
      })

      render(<CartPanel />)
      
      const incrementButton = screen.getByTestId('increment-quantity-1')
      await user.click(incrementButton)
      
      expect(mockUpdateQuantity).toHaveBeenCalledWith('product-1', 3)
    })

    it('should display item modifiers when present', () => {
      const mockItems = [
        {
          id: '1',
          productId: 'product-1',
          name: 'Hamburguesa',
          unitPrice: 12.99,
          quantity: 1,
          totalPrice: 14.49,
          category: 'FOOD',
          sku: 'BURG-001',
          modifiers: [
            { id: 'mod1', name: 'Queso Extra', price: 1.50 }
          ]
        }
      ]

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: mockItems
      })

      render(<CartPanel />)
      
      expect(screen.getByTestId('item-modifiers-1')).toBeInTheDocument()
      expect(screen.getByText('Queso Extra')).toBeInTheDocument()
      expect(screen.getByText('+$1.50')).toBeInTheDocument()
    })
  })

  describe('Cart Totals', () => {
    it('should display correct totals', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 2.60,
        taxAmount: 3.74,
        total: 27.12,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: [
          {
            id: '1',
            productId: 'product-1',
            name: 'Hamburguesa',
            unitPrice: 12.99,
            quantity: 2,
            totalPrice: 25.98,
            category: 'FOOD',
            sku: 'BURG-001',
            modifiers: []
          }
        ],
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartPanel />)
      
      expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('$25.98')
      expect(screen.getByTestId('cart-discount')).toHaveTextContent('-$2.60')
      expect(screen.getByTestId('cart-tax')).toHaveTextContent('$3.74')
      expect(screen.getByTestId('cart-total')).toHaveTextContent('$27.12')
      expect(screen.getByTestId('cart-item-count')).toHaveTextContent('2')
    })

    it('should hide discount section when no discount', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 0,
        taxAmount: 3.74,
        total: 29.72,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: [
          {
            id: '1',
            productId: 'product-1',
            name: 'Hamburguesa',
            unitPrice: 12.99,
            quantity: 2,
            totalPrice: 25.98,
            category: 'FOOD',
            sku: 'BURG-001',
            modifiers: []
          }
        ],
        discount: 0,
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartPanel />)
      
      expect(screen.queryByTestId('cart-discount')).not.toBeInTheDocument()
    })
  })

  describe('Customer Information', () => {
    it('should display customer information when present', () => {
      const mockCustomer = {
        name: 'John Doe',
        phone: '555-1234',
        email: 'john@example.com'
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        customer: mockCustomer
      })

      render(<CartPanel />)
      
      expect(screen.getByTestId('customer-info')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('555-1234')).toBeInTheDocument()
    })

    it('should not display customer info when null', () => {
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        customer: null
      })

      render(<CartPanel />)
      
      expect(screen.queryByTestId('customer-info')).not.toBeInTheDocument()
    })
  })

  describe('Payment Method', () => {
    it('should display current payment method', () => {
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        paymentMethod: 'CARD'
      })

      render(<CartPanel />)
      
      expect(screen.getByTestId('payment-method')).toHaveTextContent('Tarjeta')
    })

    it('should call setPaymentMethod when payment method is changed', async () => {
      const user = userEvent.setup()
      const mockSetPaymentMethod = vi.fn()
      
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        paymentMethod: 'CASH',
        setPaymentMethod: mockSetPaymentMethod
      })

      render(<CartPanel />)
      
      const paymentMethodSelect = screen.getByTestId('payment-method-select')
      await user.click(paymentMethodSelect)
      
      const cardOption = screen.getByText('Tarjeta')
      await user.click(cardOption)
      
      expect(mockSetPaymentMethod).toHaveBeenCalledWith('CARD')
    })
  })

  describe('Discount', () => {
    it('should display discount information when applied', () => {
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        discount: 10,
        discountType: 'percentage'
      })

      render(<CartPanel />)
      
      expect(screen.getByTestId('discount-info')).toBeInTheDocument()
      expect(screen.getByText('10% descuento')).toBeInTheDocument()
    })

    it('should call clearCart when clear cart button is clicked', async () => {
      const user = userEvent.setup()
      const mockClearCart = vi.fn()
      
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: [
          {
            id: '1',
            productId: 'product-1',
            name: 'Hamburguesa',
            unitPrice: 12.99,
            quantity: 2,
            totalPrice: 25.98,
            category: 'FOOD',
            sku: 'BURG-001',
            modifiers: []
          }
        ],
        clearCart: mockClearCart
      })

      render(<CartPanel />)
      
      const clearButton = screen.getByTestId('clear-cart')
      await user.click(clearButton)
      
      expect(mockClearCart).toHaveBeenCalled()
    })
  })

  describe('Actions', () => {
    it('should call toggleCart when close button is clicked', async () => {
      const user = userEvent.setup()
      const mockToggleCart = vi.fn()
      
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        toggleCart: mockToggleCart
      })

      render(<CartPanel />)
      
      const closeButton = screen.getByTestId('close-cart')
      await user.click(closeButton)
      
      expect(mockToggleCart).toHaveBeenCalled()
    })

    it('should disable checkout button when cart is empty', () => {
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: [],
        getItemCount: vi.fn().mockReturnValue(0)
      })

      render(<CartPanel />)
      
      const checkoutButton = screen.getByTestId('checkout-button')
      expect(checkoutButton).toBeDisabled()
    })

    it('should enable checkout button when cart has items', () => {
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: [
          {
            id: '1',
            productId: 'product-1',
            name: 'Hamburguesa',
            unitPrice: 12.99,
            quantity: 1,
            totalPrice: 12.99,
            category: 'FOOD',
            sku: 'BURG-001',
            modifiers: []
          }
        ],
        getItemCount: vi.fn().mockReturnValue(1)
      })

      render(<CartPanel />)
      
      const checkoutButton = screen.getByTestId('checkout-button')
      expect(checkoutButton).not.toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: [
          {
            id: '1',
            productId: 'product-1',
            name: 'Hamburguesa',
            unitPrice: 12.99,
            quantity: 2,
            totalPrice: 25.98,
            category: 'FOOD',
            sku: 'BURG-001',
            modifiers: []
          }
        ]
      })

      render(<CartPanel />)
      
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Carrito de compras')
      expect(screen.getByRole('button', { name: /eliminar hamburguesa/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        isOpen: true,
        items: [
          {
            id: '1',
            productId: 'product-1',
            name: 'Hamburguesa',
            unitPrice: 12.99,
            quantity: 1,
            totalPrice: 12.99,
            category: 'FOOD',
            sku: 'BURG-001',
            modifiers: []
          }
        ]
      })

      render(<CartPanel />)
      
      await user.tab()
      expect(screen.getByTestId('close-cart')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('checkout-button')).toHaveFocus()
    })
  })
})
