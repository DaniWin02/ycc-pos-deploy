import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuItemCard } from '../../../04_CORE_POS/src/components/MenuItemCard'
import { Product } from '../../../04_CORE_POS/src/types'

describe('MenuItemCard Component', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Hamburguesa Clásica',
    price: 12.99,
    category: 'FOOD',
    sku: 'BURG-001',
    stock: 50,
    isActive: true,
    description: 'Deliciosa hamburguesa con carne 100% beef'
  }

  const mockAddToCart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render product information correctly', () => {
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      expect(screen.getByTestId('menu-item-card')).toBeInTheDocument()
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument()
      expect(screen.getByText('$12.99')).toBeInTheDocument()
      expect(screen.getByText('Deliciosa hamburguesa con carne 100% beef')).toBeInTheDocument()
      expect(screen.getByTestId('product-image')).toBeInTheDocument()
    })

    it('should render without description when not provided', () => {
      const productWithoutDescription = { ...mockProduct, description: undefined }
      
      render(<MenuItemCard product={productWithoutDescription} onAddToCart={mockAddToCart} />)
      
      expect(screen.queryByText('Deliciosa hamburguesa con carne 100% beef')).not.toBeInTheDocument()
    })

    it('should display category badge', () => {
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      expect(screen.getByTestId('category-badge')).toBeInTheDocument()
      expect(screen.getByTestId('category-badge')).toHaveTextContent('FOOD')
    })

    it('should display stock information', () => {
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      expect(screen.getByTestId('stock-info')).toBeInTheDocument()
      expect(screen.getByTestId('stock-info')).toHaveTextContent('50 disponibles')
    })

    it('should show low stock warning when stock is low', () => {
      const lowStockProduct = { ...mockProduct, stock: 3 }
      
      render(<MenuItemCard product={lowStockProduct} onAddToCart={mockAddToCart} />)
      
      expect(screen.getByTestId('low-stock-warning')).toBeInTheDocument()
      expect(screen.getByTestId('low-stock-warning')).toHaveTextContent('¡Solo 3 disponibles!')
    })

    it('should show out of stock when no stock available', () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 }
      
      render(<MenuItemCard product={outOfStockProduct} onAddToCart={mockAddToCart} />)
      
      expect(screen.getByTestId('out-of-stock')).toBeInTheDocument()
      expect(screen.getByTestId('out-of-stock')).toHaveTextContent('Agotado')
    })

    it('should not render when product is inactive', () => {
      const inactiveProduct = { ...mockProduct, isActive: false }
      
      render(<MenuItemCard product={inactiveProduct} onAddToCart={mockAddToCart} />)
      
      expect(screen.queryByTestId('menu-item-card')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onAddToCart when add to cart button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      await user.click(addButton)
      
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1)
    })

    it('should call onAddToCart with quantity when quantity is selected', async () => {
      const user = userEvent.setup()
      
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      const quantityButton = screen.getByTestId('quantity-button')
      await user.click(quantityButton)
      
      const quantityOption = screen.getByText('3')
      await user.click(quantityOption)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      await user.click(addButton)
      
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 3)
    })

    it('should open modifier selection when product has modifiers', async () => {
      const user = userEvent.setup()
      const productWithModifiers = {
        ...mockProduct,
        modifiers: [
          { id: 'mod1', name: 'Queso Extra', price: 1.50 },
          { id: 'mod2', name: 'Bacon', price: 2.00 }
        ]
      }
      
      render(<MenuItemCard product={productWithModifiers} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      await user.click(addButton)
      
      expect(screen.getByTestId('modifier-selection-modal')).toBeInTheDocument()
    })

    it('should close modifier selection when cancel is clicked', async () => {
      const user = userEvent.setup()
      const productWithModifiers = {
        ...mockProduct,
        modifiers: [
          { id: 'mod1', name: 'Queso Extra', price: 1.50 }
        ]
      }
      
      render(<MenuItemCard product={productWithModifiers} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      await user.click(addButton)
      
      const cancelButton = screen.getByTestId('cancel-modifiers')
      await user.click(cancelButton)
      
      expect(screen.queryByTestId('modifier-selection-modal')).not.toBeInTheDocument()
    })

    it('should add to cart with selected modifiers', async () => {
      const user = userEvent.setup()
      const productWithModifiers = {
        ...mockProduct,
        modifiers: [
          { id: 'mod1', name: 'Queso Extra', price: 1.50 },
          { id: 'mod2', name: 'Bacon', price: 2.00 }
        ]
      }
      
      render(<MenuItemCard product={productWithModifiers} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      await user.click(addButton)
      
      const cheeseModifier = screen.getByTestId('modifier-mod1')
      await user.click(cheeseModifier)
      
      const confirmButton = screen.getByTestId('confirm-modifiers')
      await user.click(confirmButton)
      
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1, [
        { id: 'mod1', name: 'Queso Extra', price: 1.50 }
      ])
    })
  })

  describe('Quantity Selection', () => {
    it('should show quantity selector when quantity button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      const quantityButton = screen.getByTestId('quantity-button')
      await user.click(quantityButton)
      
      expect(screen.getByTestId('quantity-selector')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should update button text when quantity is selected', async () => {
      const user = userEvent.setup()
      
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      const quantityButton = screen.getByTestId('quantity-button')
      await user.click(quantityButton)
      
      const quantityOption = screen.getByText('3')
      await user.click(quantityOption)
      
      expect(screen.getByTestId('quantity-button')).toHaveTextContent('Agregar 3')
    })

    it('should close quantity selector when clicking outside', async () => {
      const user = userEvent.setup()
      
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      const quantityButton = screen.getByTestId('quantity-button')
      await user.click(quantityButton)
      
      expect(screen.getByTestId('quantity-selector')).toBeInTheDocument()
      
      await user.click(document.body)
      
      expect(screen.queryByTestId('quantity-selector')).not.toBeInTheDocument()
    })
  })

  describe('Modifier Selection', () => {
    it('should display available modifiers', async () => {
      const user = userEvent.setup()
      const productWithModifiers = {
        ...mockProduct,
        modifiers: [
          { id: 'mod1', name: 'Queso Extra', price: 1.50 },
          { id: 'mod2', name: 'Bacon', price: 2.00 }
        ]
      }
      
      render(<MenuItemCard product={productWithModifiers} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      await user.click(addButton)
      
      expect(screen.getByText('Queso Extra (+$1.50)')).toBeInTheDocument()
      expect(screen.getByText('Bacon (+$2.00)')).toBeInTheDocument()
    })

    it('should show selected modifiers count', async () => {
      const user = userEvent.setup()
      const productWithModifiers = {
        ...mockProduct,
        modifiers: [
          { id: 'mod1', name: 'Queso Extra', price: 1.50 },
          { id: 'mod2', name: 'Bacon', price: 2.00 }
        ]
      }
      
      render(<MenuItemCard product={productWithModifiers} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      await user.click(addButton)
      
      const cheeseModifier = screen.getByTestId('modifier-mod1')
      await user.click(cheeseModifier)
      
      expect(screen.getByTestId('selected-modifiers-count')).toHaveTextContent('1 seleccionado')
    })

    it('should calculate updated price with modifiers', async () => {
      const user = userEvent.setup()
      const productWithModifiers = {
        ...mockProduct,
        modifiers: [
          { id: 'mod1', name: 'Queso Extra', price: 1.50 },
          { id: 'mod2', name: 'Bacon', price: 2.00 }
        ]
      }
      
      render(<MenuItemCard product={productWithModifiers} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      await user.click(addButton)
      
      const cheeseModifier = screen.getByTestId('modifier-mod1')
      await user.click(cheeseModifier)
      
      expect(screen.getByTestId('updated-price')).toHaveTextContent('$14.49')
    })
  })

  describe('Button States', () => {
    it('should disable add button when out of stock', () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 }
      
      render(<MenuItemCard product={outOfStockProduct} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      expect(addButton).toBeDisabled()
    })

    it('should show loading state when adding to cart', async () => {
      const user = userEvent.setup()
      mockAddToCart.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      await user.click(addButton)
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(addButton).toBeDisabled()
    })

    it('should show success state after adding to cart', async () => {
      const user = userEvent.setup()
      mockAddToCart.mockResolvedValue(undefined)
      
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      const addButton = screen.getByTestId('add-to-cart-button')
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('success-checkmark')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      expect(screen.getByRole('button', { name: /agregar hamburguesa clásica/i })).toBeInTheDocument()
      expect(screen.getByRole('img', { name: /hamburguesa clásica/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      await user.tab()
      expect(screen.getByTestId('add-to-cart-button')).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1)
    })

    it('should announce stock status to screen readers', () => {
      const lowStockProduct = { ...mockProduct, stock: 3 }
      
      render(<MenuItemCard product={lowStockProduct} onAddToCart={mockAddToCart} />)
      
      expect(screen.getByTestId('stock-info')).toHaveAttribute('aria-label', '3 disponibles - stock bajo')
    })
  })

  describe('Responsive Design', () => {
    it('should adapt layout for mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} />)
      
      expect(screen.getByTestId('menu-item-card')).toHaveClass('mobile-layout')
    })

    it('should show compact view in grid layout', () => {
      render(<MenuItemCard product={mockProduct} onAddToCart={mockAddToCart} layout="compact" />)
      
      expect(screen.getByTestId('menu-item-card')).toHaveClass('compact-layout')
      expect(screen.queryByText('Deliciosa hamburguesa con carne 100% beef')).not.toBeInTheDocument()
    })
  })
})
