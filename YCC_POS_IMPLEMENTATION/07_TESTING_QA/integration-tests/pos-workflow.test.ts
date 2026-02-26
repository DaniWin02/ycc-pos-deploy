import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosApp } from '../../04_CORE_POS/src/App';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock del servidor
const server = setupServer(
  rest.get('/api/products', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          name: 'Hamburguesa Clásica',
          price: 50.00,
          category: 'Comidas',
          stock: 100
        },
        {
          id: '2',
          name: 'Coca Cola',
          price: 20.00,
          category: 'Bebidas',
          stock: 200
        }
      ])
    );
  }),
  rest.post('/api/orders', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'order-123',
        folio: 'ORD-001',
        totalAmount: 70.00,
        status: 'COMPLETED'
      })
    );
  }),
  rest.get('/api/orders/:id', (req, res, ctx) => {
    const { id } = req.params;
    if (id === 'order-123') {
      return res(
        ctx.json({
          id: 'order-123',
          folio: 'ORD-001',
          items: [
            {
              productId: '1',
              productName: 'Hamburguesa Clásica',
              quantity: 1,
              unitPrice: 50.00
            },
            {
              productId: '2',
              productName: 'Coca Cola',
              quantity: 1,
              unitPrice: 20.00
            }
          ],
          totalAmount: 70.00,
          status: 'COMPLETED'
        })
      );
    }
    return res(
      ctx.status(404),
      ctx.json({ error: 'Order not found' })
    );
  })
);

describe('POS Workflow Integration Tests', () => {
  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('flujo completo de venta - desde búsqueda hasta confirmación', async () => {
    render(<PosApp />);

    // 1. Buscar producto
    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    await userEvent.type(searchInput, 'Hamburguesa');

    // 2. Esperar y seleccionar producto
    await waitFor(() => {
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    });

    const productCard = screen.getByText('Hamburguesa Clásica').closest('[data-testid="product-card"]');
    await userEvent.click(productCard);

    // 3. Verificar que se agregó al carrito
    await waitFor(() => {
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
      expect(screen.getByText('$50.00')).toBeInTheDocument();
    });

    // 4. Agregar otro producto
    const searchInput2 = screen.getByPlaceholderText('Buscar productos...');
    await userEvent.clear(searchInput2);
    await userEvent.type(searchInput2, 'Coca Cola');

    await waitFor(() => {
      expect(screen.getByText('Coca Cola')).toBeInTheDocument();
    });

    const productCard2 = screen.getByText('Coca Cola').closest('[data-testid="product-card"]');
    await userEvent.click(productCard2);

    // 5. Verificar carrito con ambos productos
    await waitFor(() => {
      expect(screen.getByText('Subtotal:')).toBeInTheDocument();
      expect(screen.getByText('$70.00')).toBeInTheDocument();
    });

    // 6. Procesar pago
    const checkoutButton = screen.getByText('Procesar Pago');
    await userEvent.click(checkoutButton);

    // 7. Verificar que se creó la orden
    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('¡Orden completada!')).toBeInTheDocument();
    });
  });

  test('manejo de errores en el flujo de venta', async () => {
    // Simular error del servidor
    server.use(
      rest.post('/api/orders', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Server error' })
        );
      })
    );

    render(<PosApp />);

    // Agregar producto al carrito
    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    await userEvent.type(searchInput, 'Hamburguesa');

    await waitFor(() => {
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    });

    const productCard = screen.getByText('Hamburguesa Clásica').closest('[data-testid="product-card"]');
    await userEvent.click(productCard);

    // Intentar procesar pago
    const checkoutButton = screen.getByText('Procesar Pago');
    await userEvent.click(checkoutButton);

    // Verificar mensaje de error
    await waitFor(() => {
      expect(screen.getByText('Error al procesar la orden')).toBeInTheDocument();
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  test('flujo de modificación de orden', async () => {
    render(<PosApp />);

    // Simular que ya existe una orden activa
    localStorage.setItem('activeOrderId', 'order-123');

    // Cargar la orden existente
    const loadOrderButton = screen.getByText('Cargar Orden');
    await userEvent.click(loadOrderButton);

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
      expect(screen.getByText('Coca Cola')).toBeInTheDocument();
    });

    // Modificar cantidad
    const quantityInput = screen.getByDisplayValue('1');
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '2');

    // Verificar que se actualizó el total
    await waitFor(() => {
      expect(screen.getByText('$90.00')).toBeInTheDocument();
    });

    // Actualizar orden
    const updateButton = screen.getByText('Actualizar Orden');
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('¡Orden actualizada!')).toBeInTheDocument();
    });
  });

  test('flujo de cancelación de orden', async () => {
    render(<PosApp />);

    // Crear una orden
    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    await userEvent.type(searchInput, 'Hamburguesa');

    await waitFor(() => {
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    });

    const productCard = screen.getByText('Hamburguesa Clásica').closest('[data-testid="product-card"]');
    await userEvent.click(productCard);

    // Cancelar orden
    const cancelButton = screen.getByText('Cancelar Orden');
    await userEvent.click(cancelButton);

    // Confirmar cancelación
    const confirmButton = screen.getByText('Confirmar Cancelación');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('¡Orden cancelada!')).toBeInTheDocument();
      expect(screen.queryByText('Hamburguesa Clásica')).not.toBeInTheDocument();
    });
  });

  test('flujo con múltiples métodos de pago', async () => {
    render(<PosApp />);

    // Agregar productos al carrito
    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    await userEvent.type(searchInput, 'Hamburguesa');

    await waitFor(() => {
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    });

    const productCard = screen.getByText('Hamburguesa Clásica').closest('[data-testid="product-card"]');
    await userEvent.click(productCard);

    // Procesar pago
    const checkoutButton = screen.getByText('Procesar Pago');
    await userEvent.click(checkoutButton);

    // Seleccionar método de pago
    await waitFor(() => {
      expect(screen.getByText('Seleccionar Método de Pago')).toBeInTheDocument();
    });

    // Probar diferentes métodos
    const creditCardButton = screen.getByText('Tarjeta de Crédito');
    await userEvent.click(creditCardButton);

    await waitFor(() => {
      expect(screen.getByText('Procesando pago con tarjeta...')).toBeInTheDocument();
    });

    // Verificar que se completó el pago
    await waitFor(() => {
      expect(screen.getByText('¡Pago procesado!')).toBeInTheDocument();
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
    });
  });

  test('flujo con descuentos y promociones', async () => {
    render(<PosApp />);

    // Agregar productos
    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    await userEvent.type(searchInput, 'Hamburguesa');

    await waitFor(() => {
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    });

    const productCard = screen.getByText('Hamburguesa Clásica').closest('[data-testid="product-card"]');
    await userEvent.click(productCard);

    // Aplicar descuento
    const discountButton = screen.getByText('Aplicar Descuento');
    await userEvent.click(discountButton);

    const discountInput = screen.getByPlaceholderText('Código de descuento');
    await userEvent.type(discountInput, 'DESCUENTO10');

    const applyButton = screen.getByText('Aplicar');
    await userEvent.click(applyButton);

    // Verificar que se aplicó el descuento
    await waitFor(() => {
      expect(screen.getByText('Descuento:')).toBeInTheDocument();
      expect(screen.getByText('-$5.00')).toBeInTheDocument();
      expect(screen.getByText('$45.00')).toBeInTheDocument();
    });
  });

  test('flujo con inventario insuficiente', async () => {
    // Simular producto sin stock
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(
          ctx.json([
            {
              id: '1',
              name: 'Producto Sin Stock',
              price: 50.00,
              category: 'Comidas',
              stock: 0
            }
          ])
        );
      })
    );

    render(<PosApp />);

    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    await userEvent.type(searchInput, 'Producto Sin Stock');

    await waitFor(() => {
      expect(screen.getByText('Producto Sin Stock')).toBeInTheDocument();
    });

    const productCard = screen.getByText('Producto Sin Stock').closest('[data-testid="product-card"]');
    await userEvent.click(productCard);

    // Verificar mensaje de stock insuficiente
    await waitFor(() => {
      expect(screen.getByText('Producto sin stock disponible')).toBeInTheDocument();
      expect(screen.getByText('Stock: 0')).toBeInTheDocument();
    });
  });

  test('flujo de búsqueda avanzada', async () => {
    render(<PosApp />);

    // Búsqueda por categoría
    const categoryFilter = screen.getByText('Todas las Categorías');
    await userEvent.click(categoryFilter);

    const foodCategory = screen.getByText('Comidas');
    await userEvent.click(foodCategory);

    // Búsqueda por precio
    const priceFilter = screen.getByText('Filtrar por Precio');
    await userEvent.click(priceFilter);

    const minPrice = screen.getByPlaceholderText('Precio Mínimo');
    await userEvent.type(minPrice, '10');

    const maxPrice = screen.getByPlaceholderText('Precio Máximo');
    await userEvent.type(maxPrice, '100');

    // Aplicar filtros
    const applyFiltersButton = screen.getByText('Aplicar Filtros');
    await userEvent.click(applyFiltersButton);

    // Verificar resultados filtrados
    await waitFor(() => {
      expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
      expect(screen.queryByText('Producto Caro')).not.toBeInTheDocument();
    });
  });
});
