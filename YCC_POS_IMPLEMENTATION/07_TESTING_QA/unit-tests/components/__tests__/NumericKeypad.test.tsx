import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumericKeypad } from '../../../04_CORE_POS/src/components/NumericKeypad'

describe('NumericKeypad Component', () => {
  const mockOnValueChange = vi.fn()
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all numeric buttons', () => {
      render(<NumericKeypad onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      // Test numeric buttons 0-9
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByTestId(`button-${i}`)).toBeInTheDocument()
      }
      
      // Test special buttons
      expect(screen.getByTestId('button-clear')).toBeInTheDocument()
      expect(screen.getByTestId('button-delete')).toBeInTheDocument()
      expect(screen.getByTestId('button-decimal')).toBeInTheDocument()
      expect(screen.getByTestId('button-submit')).toBeInTheDocument()
    })

    it('should display current value', () => {
      render(<NumericKeypad value="123.45" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      expect(screen.getByTestId('keypad-display')).toHaveTextContent('123.45')
    })

    it('should show placeholder when no value', () => {
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      expect(screen.getByTestId('keypad-display')).toHaveTextContent('0')
    })

    it('should render with custom title', () => {
      render(<NumericKeypad title="Enter Amount" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      expect(screen.getByText('Enter Amount')).toBeInTheDocument()
    })

    it('should render without title when not provided', () => {
      render(<NumericKeypad onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })
  })

  describe('Numeric Input', () => {
    it('should call onValueChange when numeric button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const button1 = screen.getByTestId('button-1')
      await user.click(button1)
      
      expect(mockOnValueChange).toHaveBeenCalledWith('1')
    })

    it('should append digits to existing value', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="12" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const button3 = screen.getByTestId('button-3')
      await user.click(button3)
      
      expect(mockOnValueChange).toHaveBeenCalledWith('123')
    })

    it('should handle multiple digit inputs', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.click(screen.getByTestId('button-1'))
      await user.click(screen.getByTestId('button-2'))
      await user.click(screen.getByTestId('button-3'))
      
      expect(mockOnValueChange).toHaveBeenNthCalledWith(1, '1')
      expect(mockOnValueChange).toHaveBeenNthCalledWith(2, '12')
      expect(mockOnValueChange).toHaveBeenNthCalledWith(3, '123')
    })
  })

  describe('Decimal Input', () => {
    it('should add decimal point when decimal button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="12" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const decimalButton = screen.getByTestId('button-decimal')
      await user.click(decimalButton)
      
      expect(mockOnValueChange).toHaveBeenCalledWith('12.')
    })

    it('should not add multiple decimal points', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="12.5" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const decimalButton = screen.getByTestId('button-decimal')
      await user.click(decimalButton)
      
      expect(mockOnValueChange).not.toHaveBeenCalled()
    })

    it('should allow decimal as first character', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const decimalButton = screen.getByTestId('button-decimal')
      await user.click(decimalButton)
      
      expect(mockOnValueChange).toHaveBeenCalledWith('0.')
    })
  })

  describe('Clear Functionality', () => {
    it('should clear value when clear button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="123.45" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const clearButton = screen.getByTestId('button-clear')
      await user.click(clearButton)
      
      expect(mockOnValueChange).toHaveBeenCalledWith('')
    })

    it('should clear value when Escape key is pressed', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="123.45" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.keyboard('{Escape}')
      
      expect(mockOnValueChange).toHaveBeenCalledWith('')
    })
  })

  describe('Delete Functionality', () => {
    it('should delete last character when delete button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="123.45" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const deleteButton = screen.getByTestId('button-delete')
      await user.click(deleteButton)
      
      expect(mockOnValueChange).toHaveBeenCalledWith('123.4')
    })

    it('should delete last character when Backspace key is pressed', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="123.45" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.keyboard('{Backspace}')
      
      expect(mockOnValueChange).toHaveBeenCalledWith('123.4')
    })

    it('should handle delete when value is empty', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const deleteButton = screen.getByTestId('button-delete')
      await user.click(deleteButton)
      
      expect(mockOnValueChange).not.toHaveBeenCalled()
    })

    it('should handle delete when value has one character', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="5" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const deleteButton = screen.getByTestId('button-delete')
      await user.click(deleteButton)
      
      expect(mockOnValueChange).toHaveBeenCalledWith('')
    })
  })

  describe('Submit Functionality', () => {
    it('should call onSubmit when submit button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="123.45" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByTestId('button-submit')
      await user.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledWith('123.45')
    })

    it('should call onSubmit when Enter key is pressed', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="123.45" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.keyboard('{Enter}')
      
      expect(mockOnSubmit).toHaveBeenCalledWith('123.45')
    })

    it('should disable submit button when value is empty', () => {
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByTestId('button-submit')
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when value is not empty', () => {
      render(<NumericKeypad value="123" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByTestId('button-submit')
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Validation', () => {
    it('should respect maxLength prop', async () => {
      const user = userEvent.setup()
      
      render(<NumericKe maxLength={5} value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.click(screen.getByTestId('button-1'))
      await user.click(screen.getByTestId('button-2'))
      await user.click(screen.getByTestId('button-3'))
      await user.click(screen.getByTestId('button-4'))
      await user.click(screen.getByTestId('button-5'))
      
      expect(mockOnValueChange).toHaveBeenLastCalledWith('12345')
      
      // Try to add one more digit
      await user.click(screen.getByTestId('button-6'))
      
      // Should not have been called again
      expect(mockOnValueChange).toHaveBeenCalledTimes(5)
    })

    it('should validate numeric input with allowDecimal false', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad allowDecimal={false} value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const decimalButton = screen.getByTestId('button-decimal')
      expect(decimalButton).toBeDisabled()
    })

    it('should validate minimum value', async () => {
      const user = userEvent.setup()
      const mockOnValidate = vi.fn().mockReturnValue(false)
      
      render(<NumericKeypad minValue={10} value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} onValidate={mockOnValidate} />)
      
      await user.click(screen.getByTestId('button-5'))
      await user.click(screen.getByTestId('button-submit'))
      
      expect(mockOnValidate).toHaveBeenCalledWith('5')
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should validate maximum value', async () => {
      const user = userEvent.setup()
      const mockOnValidate = vi.fn().mockReturnValue(false)
      
      render(<NumericKeypad maxValue={100} value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} onValidate={mockOnValidate} />)
      
      await user.click(screen.getByTestId('button-1'))
      await user.click(screen.getByTestId('button-5'))
      await user.click(screen.getByTestId('button-0'))
      await user.click(screen.getByTestId('button-submit'))
      
      expect(mockOnValidate).toHaveBeenCalledWith('150')
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Support', () => {
    it('should handle numeric keyboard input', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.keyboard('1')
      await user.keyboard('2')
      await user.keyboard('3')
      
      expect(mockOnValueChange).toHaveBeenNthCalledWith(1, '1')
      expect(mockOnValueChange).toHaveBeenNthCalledWith(2, '12')
      expect(mockOnValueChange).toHaveBeenNthCalledWith(3, '123')
    })

    it('should handle decimal point keyboard input', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="12" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.keyboard('.')
      
      expect(mockOnValueChange).toHaveBeenCalledWith('12.')
    })

    it('should handle keyboard delete', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="123" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.keyboard('{Backspace}')
      
      expect(mockOnValueChange).toHaveBeenCalledWith('12')
    })

    it('should handle keyboard clear', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="123" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.keyboard('{Escape}')
      
      expect(mockOnValueChange).toHaveBeenCalledWith('')
    })
  })

  describe('Visual Feedback', () => {
    it('should show button press feedback', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      const button1 = screen.getByTestId('button-1')
      
      await user.pointerDown(button1)
      expect(button1).toHaveClass('active')
      
      await user.pointerUp(button1)
      expect(button1).not.toHaveClass('active')
    })

    it('should show error state when validation fails', async () => {
      const user = userEvent.setup()
      const mockOnValidate = vi.fn().mockReturnValue(false)
      
      render(<NumericKeypad minValue={10} value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} onValidate={mockOnValidate} />)
      
      await user.click(screen.getByTestId('button-5'))
      await user.click(screen.getByTestId('button-submit'))
      
      expect(screen.getByTestId('keypad-display')).toHaveClass('error')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<NumericKeypad value="123" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.tab()
      expect(screen.getByTestId('button-1')).toHaveFocus()
      
      await user.keyboard('{ArrowRight}')
      expect(screen.getByTestId('button-2')).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(mockOnValueChange).toHaveBeenCalledWith('2')
    })

    it('should announce value changes to screen readers', async () => {
      const user = userEvent.setup()
      
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      await user.click(screen.getByTestId('button-1'))
      
      const display = screen.getByTestId('keypad-display')
      expect(display).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Responsive Design', () => {
    it('should adapt layout for mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} />)
      
      expect(screen.getByTestId('numeric-keypad')).toHaveClass('mobile-layout')
    })

    it('should show compact layout when compact prop is true', () => {
      render(<NumericKeypad value="" onValueChange={mockOnValueChange} onSubmit={mockOnSubmit} compact />)
      
      expect(screen.getByTestId('numeric-keypad')).toHaveClass('compact-layout')
    })
  })
})
