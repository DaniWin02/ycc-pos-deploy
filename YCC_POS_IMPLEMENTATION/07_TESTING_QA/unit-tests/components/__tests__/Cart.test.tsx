import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cart } from '../../../04_CORE_POS/src/components/Cart';
import { CartItem } from '../../../04_CORE_POS/src/types/cart.types';

// Mock data para testing
const mockCartItem: CartItem = {
  id: 'test-item-1',
  productId: 'test-product-1',
  productName: 'Producto de Prueba',
  sku: 'TEST-001',
  quantity: 2,
  unitPrice: 50.00,
  totalPrice: 100.00,
  modifiers: [
    {
      id: 'mod-1',
      name: 'Queso Extra',
      price: 10.00,
      quantity: 1
    }
  ]
};

const mockCart = {
  items: [mockCartItem],
  subtotal: 100.00,
  taxAmount: 16.00,
  discountAmount: 0,
  tipAmount: 10.00,
  totalAmount: 126.00
};

describe('Cart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza correctamente el carrito con items', () => {
    render(<Cart cart={mockCart} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    expect(screen.getByText('Producto de Prueba')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  test('muestra el subtotal correctamente', () => {
    render(<Cart cart={mockCart} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    expect(screen.getByText('Subtotal:')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  test('muestra el total correctamente', () => {
    render(<Cart cart={mockCart} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$126.00')).toBeInTheDocument();
  });

  test('muestra los modificadores correctamente', () => {
    render(<Cart cart={mockCart} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    expect(screen.getByText('Queso Extra')).toBeInTheDocument();
    expect(screen.getByText('+$10.00')).toBeInTheDocument();
  });

  test('llama a onUpdateCart al cambiar cantidad', async () => {
    const mockOnUpdateCart = jest.fn();
    render(<Cart cart={mockCart} onUpdateCart={mockOnUpdateCart} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    const quantityInput = screen.getByDisplayValue('2');
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '3');
    
    expect(mockOnUpdateCart).toHaveBeenCalled();
  });

  test('llama a onCheckout al hacer clic en "Procesar Pago"', async () => {
    const mockOnCheckout = jest.fn();
    render(<Cart cart={mockCart} onUpdateCart={jest.fn()} onCheckout={mockOnCheckout} onClearCart={jest.fn()} />);
    
    const checkoutButton = screen.getByText('Procesar Pago');
    await userEvent.click(checkoutButton);
    
    expect(mockOnCheckout).toHaveBeenCalledWith(mockCart);
  });

  test('llama a onClearCart al hacer clic en "Vaciar Carrito"', async () => {
    const mockOnClearCart = jest.fn();
    render(<Cart cart={mockCart} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={mockOnClearCart} />);
    
    const clearButton = screen.getByText('Vaciar Carrito');
    await userEvent.click(clearButton);
    
    expect(mockOnClearCart).toHaveBeenCalled();
  });

  test('muestra mensaje cuando el carrito está vacío', () => {
    const emptyCart = { ...mockCart, items: [] };
    render(<Cart cart={emptyCart} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  });

  test('deshabilita botones cuando el carrito está vacío', () => {
    const emptyCart = { ...mockCart, items: [] };
    render(<Cart cart={emptyCart} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    const checkoutButton = screen.getByText('Procesar Pago');
    const clearButton = screen.getByText('Vaciar Carrito');
    
    expect(checkoutButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  test('calcula correctamente los totales con impuestos', () => {
    const cartWithTax = {
      ...mockCart,
      taxAmount: 16.00,
      discountAmount: 5.00,
      tipAmount: 8.00,
      totalAmount: 119.00
    };
    
    render(<Cart cart={cartWithTax} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    expect(screen.getByText('Subtotal:')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Impuestos:')).toBeInTheDocument();
    expect(screen.getByText('$16.00')).toBeInTheDocument();
    expect(screen.getByText('Descuento:')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
    expect(screen.getByText('Propina:')).toBeInTheDocument();
    expect(screen.getByText('$8.00')).toBeInTheDocument();
    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$119.00')).toBeInTheDocument();
  });

  test('es accesible con lectores de pantalla', () => {
    render(<Cart cart={mockCart} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    // Verificar que el carrito tiene un role apropiado
    const cartElement = screen.getByRole('region');
    expect(cartElement).toHaveAttribute('aria-label', 'Carrito de compras');
    
    // Verificar que los botones tienen textos descriptivos
    const checkoutButton = screen.getByText('Procesar Pago');
    expect(checkoutButton).toHaveAttribute('aria-label', 'Procesar pago y finalizar orden');
  });

  test('maneja correctamente el estado de carga', () => {
    render(<Cart cart={mockCart} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} loading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Procesando...')).toBeInTheDocument();
  });

  test('permite eliminar items del carrito', async () => {
    const mockOnUpdateCart = jest.fn();
    render(<Cart cart={mockCart} onUpdateCart={mockOnUpdateCart} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    const removeButton = screen.getByTestId(`remove-item-${mockCartItem.id}`);
    await userEvent.click(removeButton);
    
    expect(mockOnUpdateCart).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ ...mockCartItem, quantity: 1 })
      ])
    );
  });

  test('formatea correctamente los precios', () => {
    const cartWithExpensiveItem = {
      ...mockCart,
      items: [{
        ...mockCartItem,
        unitPrice: 1234.56,
        totalPrice: 2469.12
      }]
    };
    
    render(<Cart cart={cartWithExpensiveItem} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    expect(screen.getByText('$2,469.12')).toBeInTheDocument();
  });

  test('muestra correctamente los totales en diferentes monedas', () => {
    render(<Cart cart={mockCart} onUpdateCart={jest.fn()} onCheckout={jest.fn()} onClearCart={jest.fn()} />);
    
    // Verificar que se muestra el símbolo de moneda correcto
    expect(screen.getByText('MXN')).toBeInTheDocument();
    expect(screen.getByText('$126.00')).toBeInTheDocument();
  });
});
