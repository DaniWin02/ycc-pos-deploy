import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '../../../04_CORE_POS/src/components/ProductCard';
import { Product } from '../../../04_CORE_POS/src/types/product.types';

// Mock data para testing
const mockProduct: Product = {
  id: 'test-product-1',
  sku: 'TEST-001',
  name: 'Producto de Prueba',
  description: 'Descripción del producto de prueba',
  price: 100.00,
  cost: 60.00,
  categoryId: 'test-category-1',
  isActive: true,
  stock: 50,
  minStock: 10,
  image: 'test-image.jpg',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza correctamente el componente', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('Producto de Prueba')).toBeInTheDocument();
    expect(screen.getByText('TEST-001')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  test('muestra la descripción cuando existe', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('Descripción del producto de prueba')).toBeInTheDocument();
  });

  test('oculta la descripción cuando no existe', () => {
    const productWithoutDescription = { ...mockProduct, description: '' };
    render(<ProductCard product={productWithoutDescription} onAddToCart={jest.fn()} />);
    
    expect(screen.queryByText('Descripción del producto de prueba')).not.toBeInTheDocument();
  });

  test('muestra el stock correctamente', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('Stock: 50')).toBeInTheDocument();
  });

  test('llama a onAddToCart al hacer clic en "Agregar al Carrito"', async () => {
    const mockOnAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);
    
    const addButton = screen.getByText('Agregar al Carrito');
    await userEvent.click(addButton);
    
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  test('llama a onQuickSale al hacer clic en "Venta Rápida"', async () => {
    const mockOnAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);
    
    const quickSaleButton = screen.getByText('Venta Rápida');
    await userEvent.click(quickSaleButton);
    
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  test('muestra indicador de stock bajo cuando el stock es menor al mínimo', () => {
    const lowStockProduct = { ...mockProduct, stock: 5, minStock: 10 };
    render(<ProductCard product={lowStockProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('¡Stock Bajo!')).toBeInTheDocument();
  });

  test('deshabilita botones cuando el producto no está activo', () => {
    const inactiveProduct = { ...mockProduct, isActive: false };
    render(<ProductCard product={inactiveProduct} onAddToCart={jest.fn()} />);
    
    const addButton = screen.getByText('Agregar al Carrito');
    const quickSaleButton = screen.getByText('Venta Rápida');
    
    expect(addButton).toBeDisabled();
    expect(quickSaleButton).toBeDisabled();
  });

  test('aplica animaciones correctamente', async () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    const card = screen.getByTestId('product-card');
    
    // Verificar que el componente tiene las clases de animación
    expect(card).toHaveClass('transform');
    
    // Simular hover
    await userEvent.hover(card);
    
    // Verificar que se aplican las clases de hover
    expect(card).toHaveClass('scale-105');
  });

  test('es accesible con lectores de pantalla', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    // Verificar que los botones tienen atributos ARIA
    const addButton = screen.getByText('Agregar al Carrito');
    const quickSaleButton = screen.getByText('Venta Rápida');
    
    expect(addButton).toHaveAttribute('aria-label');
    expect(quickSaleButton).toHaveAttribute('aria-label');
    
    // Verificar que el componente tiene un role apropiado
    const card = screen.getByTestId('product-card');
    expect(card).toHaveAttribute('role', 'article');
  });

  test('maneja correctamente el loading state', () => {
    render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} loading={true} />);
    
    // Verificar que los botones están deshabilitados durante loading
    const addButton = screen.getByText('Agregar al Carrito');
    const quickSaleButton = screen.getByText('Venta Rápida');
    
    expect(addButton).toBeDisabled();
    expect(quickSaleButton).toBeDisabled();
    
    // Verificar que se muestra el indicador de carga
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('formatea correctamente los precios', () => {
    const expensiveProduct = { ...mockProduct, price: 1234.56 };
    render(<ProductCard product={expensiveProduct} onAddToCart={jest.fn()} />);
    
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });

  test('maneja correctamente productos sin imagen', () => {
    const productWithoutImage = { ...mockProduct, image: '' };
    render(<ProductCard product={productWithoutImage} onAddToCart={jest.fn()} />);
    
    // Verificar que se muestra el placeholder
    expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
  });

  test('es responsivo en diferentes tamaños de pantalla', () => {
    const { container } = render(<ProductCard product={mockProduct} onAddToCart={jest.fn()} />);
    
    // Simular diferentes tamaños de pantalla
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320 // Mobile
    });
    
    // Verificar que el componente se adapta al tamaño móvil
    expect(container.firstChild).toHaveClass('grid-cols-1');
    
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024 // Desktop
    });
    
    // Verificar que el componente se adapta al tamaño desktop
    expect(container.firstChild).toHaveClass('grid-cols-3');
  });
});
