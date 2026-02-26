import { renderHook, act } from '@testing-library/react';
import { useCart } from '../../../04_CORE_POS/src/hooks/useCart';

// Mock data para testing
const mockProduct = {
  id: 'test-product-1',
  name: 'Producto de Prueba',
  price: 50.00
};

describe('useCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('inicializa el carrito vacío', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  test('agrega un producto al carrito', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe(mockProduct.id);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.subtotal).toBe(50.00);
    expect(result.current.totalAmount).toBe(50.00);
  });

  test('actualiza la cantidad de un producto existente', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    act(() => {
      result.current.updateItemQuantity(mockProduct.id, 3);
    });
    
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.subtotal).toBe(150.00);
    expect(result.current.totalAmount).toBe(150.00);
  });

  test('elimina un producto del carrito', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    act(() => {
      result.current.removeFromCart(mockProduct.id);
    });
    
    expect(result.current.items).toEqual([]);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  test('limpia el carrito completamente', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    act(() => {
      result.current.clearCart();
    });
    
    expect(result.current.items).toEqual([]);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  test('calcula correctamente los totales con impuestos', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    // Verificar cálculos básicos
    expect(result.current.subtotal).toBe(50.00);
    expect(result.current.taxAmount).toBeGreaterThan(0);
    expect(result.current.totalAmount).toBeGreaterThan(50.00);
  });

  test('maneja correctamente el estado de carga', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
  });

  test('maneja correctamente los errores', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.setError('Error de prueba');
    });
    
    expect(result.current.error).toBe('Error de prueba');
    });

  test('persiste el estado del carrito', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart(mockProduct);
    });
    
    // Simular persistencia
    expect(result.current.items).toHaveLength(1);
    expect(result.current.subtotal).toBe(50.00);
  });

  test('calcula el número total de items', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct);
    });
    
    expect(result.current.totalItems).toBe(2);
  });

  test('calcula el valor total del carrito', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart({ ...mockProduct, price: 75.00 });
    });
    
    expect(result.current.totalAmount).toBe(125.00);
  });
});
