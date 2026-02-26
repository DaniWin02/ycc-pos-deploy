import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CartTotals } from '../../../04_CORE_POS/src/components/CartTotals'
import { useCartStore } from '../../../04_CORE_POS/src/stores/cart.store'

// Mock the cart store
vi.mock('../../../04_CORE_POS/src/stores/cart.store')

describe('CartTotals Component', () => {
  const mockUseCartStore = vi.mocked(useCartStore)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render cart totals correctly', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 2.60,
        taxAmount: 3.74,
        total: 27.12,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('cart-totals')).toBeInTheDocument()
      expect(screen.getByTestId('subtotal')).toHaveTextContent('$25.98')
      expect(screen.getByTestId('discount')).toHaveTextContent('-$2.60')
      expect(screen.getByTestId('tax')).toHaveTextContent('$3.74')
      expect(screen.getByTestId('total')).toHaveTextContent('$27.12')
      expect(screen.getByTestId('item-count')).toHaveTextContent('2 items')
    })

    it('should render empty cart state', () => {
      const mockTotals = {
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        total: 0,
        itemCount: 0
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(0)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('cart-totals')).toBeInTheDocument()
      expect(screen.getByTestId('subtotal')).toHaveTextContent('$0.00')
      expect(screen.getByTestId('total')).toHaveTextContent('$0.00')
      expect(screen.getByTestId('item-count')).toHaveTextContent('0 items')
    })

    it('should hide discount when no discount applied', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 0,
        taxAmount: 3.74,
        total: 29.72,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        discount: 0,
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      expect(screen.queryByTestId('discount')).not.toBeInTheDocument()
    })

    it('should show discount when applied', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 2.60,
        taxAmount: 3.74,
        total: 27.12,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        discount: 10,
        discountType: 'percentage',
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('discount')).toBeInTheDocument()
      expect(screen.getByTestId('discount')).toHaveTextContent('-$2.60')
    })

    it('should display singular item count for 1 item', () => {
      const mockTotals = {
        subtotal: 12.99,
        discountAmount: 0,
        taxAmount: 1.87,
        total: 14.86,
        itemCount: 1
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(1)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('item-count')).toHaveTextContent('1 item')
    })

    it('should display plural item count for multiple items', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 0,
        taxAmount: 3.74,
        total: 29.72,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('item-count')).toHaveTextContent('2 items')
    })
  })

  describe('Discount Display', () => {
    it('should show percentage discount type', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 2.60,
        taxAmount: 3.74,
        total: 27.12,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        discount: 10,
        discountType: 'percentage',
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('discount-type')).toHaveTextContent('10%')
    })

    it('should show amount discount type', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 5.00,
        taxAmount: 3.24,
        total: 24.22,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        discount: 5,
        discountType: 'amount',
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('discount-type')).toHaveTextContent('$5.00')
    })

    it('should show discount badge when discount is applied', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 2.60,
        taxAmount: 3.74,
        total: 27.12,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        discount: 10,
        discountType: 'percentage',
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('discount-badge')).toBeInTheDocument()
      expect(screen.getByTestId('discount-badge')).toHaveTextContent('10% OFF')
    })
  })

  describe('Tax Calculation', () => {
    it('should display tax amount correctly', () => {
      const mockTotals = {
        subtotal: 100.00,
        discountAmount: 10.00,
        taxAmount: 12.60,
        total: 102.60,
        itemCount: 1
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(1)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('tax')).toHaveTextContent('$12.60')
    })

    it('should show tax rate information', () => {
      const mockTotals = {
        subtotal: 100.00,
        discountAmount: 0,
        taxAmount: 16.00,
        total: 116.00,
        itemCount: 1
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(1)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('tax-rate')).toHaveTextContent('(16%)')
    })
  })

  describe('Currency Formatting', () => {
    it('should format currency with 2 decimal places', () => {
      const mockTotals = {
        subtotal: 12.99,
        discountAmount: 0,
        taxAmount: 1.87,
        total: 14.86,
        itemCount: 1
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(1)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('subtotal')).toHaveTextContent('$12.99')
      expect(screen.getByTestId('total')).toHaveTextContent('$14.86')
    })

    it('should format currency with no cents for whole numbers', () => {
      const mockTotals = {
        subtotal: 100.00,
        discountAmount: 0,
        taxAmount: 16.00,
        total: 116.00,
        itemCount: 1
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(1)
      })

      render(<CartTotals />)
      
      expect(screen.getByTestId('subtotal')).toHaveTextContent('$100.00')
      expect(screen.getByTestId('total')).toHaveTextContent('$116.00')
    })
  })

  describe('Layout and Structure', () => {
    it('should have proper semantic structure', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 2.60,
        taxAmount: 3.74,
        total: 27.12,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      expect(screen.getByRole('region', { name: /cart totals/i })).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(4) // subtotal, discount, tax, total
    })

    it('should display totals in correct order', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 2.60,
        taxAmount: 3.74,
        total: 27.12,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      const items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveTextContent('Subtotal')
      expect(items[1]).toHaveTextContent('Discount')
      expect(items[2]).toHaveTextContent('Tax')
      expect(items[3]).toHaveTextContent('Total')
    })

    it('should emphasize total amount', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 2.60,
        taxAmount: 3.74,
        total: 27.12,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      const totalElement = screen.getByTestId('total')
      expect(totalElement).toHaveClass('font-bold', 'text-xl')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 2.60,
        taxAmount: 3.74,
        total: 27.12,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Cart totals summary')
      expect(screen.getByTestId('subtotal')).toHaveAttribute('aria-label', 'Subtotal amount')
      expect(screen.getByTestId('total')).toHaveAttribute('aria-label', 'Total amount')
    })

    it('should announce changes to screen readers', () => {
      const mockTotals = {
        subtotal: 25.98,
        discountAmount: 2.60,
        taxAmount: 3.74,
        total: 27.12,
        itemCount: 2
      }

      mockUseCartStore.mockReturnValue({
        ...mockUseCartStore(),
        getTotals: vi.fn().mockReturnValue(mockTotals),
        getItemCount: vi.fn().mockReturnValue(2)
      })

      render(<CartTotals />)
      
      const totalsRegion = screen.getByRole('region')
      expect(totalsRegion).toHaveAttribute('aria-live', 'polite')
    })
  })
})
