// Factory para crear datos de prueba consistentes

// Factory para productos
export const createMockProduct = (overrides = {}) => {
  return {
    id: 'prod_' + Math.random().toString(36).substr(2, 9),
    sku: 'SKU-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    name: 'Producto de Prueba',
    description: 'Descripción del producto de prueba',
    price: 100.00,
    cost: 60.00,
    categoryId: 'cat_1',
    categoryName: 'Comidas',
    isActive: true,
    stock: 100,
    minStock: 10,
    image: 'https://example.com/product.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides
  };
};

// Factory para categorías
export const createMockCategory = (overrides = {}) => {
  return {
    id: 'cat_' + Math.random().toString(36).substr(2, 9),
    name: 'Categoría de Prueba',
    description: 'Descripción de la categoría',
    isActive: true,
    parentId: null,
    sortOrder: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides
  };
};

// Factory para órdenes
export const createMockOrder = (overrides = {}) => {
  const items = overrides.items || [createMockCartItem()];
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = subtotal * 0.16; // 16% IVA
  const totalAmount = subtotal + taxAmount;

  return {
    id: 'order_' + Math.random().toString(36).substr(2, 9),
    folio: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    customerId: 'customer_' + Math.random().toString(36).substr(2, 9),
    customerName: 'Cliente de Prueba',
    customerEmail: 'cliente@prueba.com',
    customerPhone: '555-123-4567',
    items,
    subtotal,
    taxAmount,
    discountAmount: 0,
    tipAmount: 0,
    totalAmount,
    status: 'ACTIVE',
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    terminalId: 'TERM-01',
    userId: 'user_1',
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    ...overrides
  };
};

// Factory para items de carrito/orden
export const createMockCartItem = (overrides = {}) => {
  const quantity = overrides.quantity || 1;
  const unitPrice = overrides.unitPrice || 100.00;
  const totalPrice = quantity * unitPrice;

  return {
    id: 'item_' + Math.random().toString(36).substr(2, 9),
    productId: 'prod_' + Math.random().toString(36).substr(2, 9),
    productName: 'Producto de Prueba',
    productSku: 'SKU-TEST',
    quantity,
    unitPrice,
    totalPrice,
    modifiers: overrides.modifiers || [],
    notes: '',
    ...overrides
  };
};

// Factory para modificadores
export const createMockModifier = (overrides = {}) => {
  return {
    id: 'mod_' + Math.random().toString(36).substr(2, 9),
    name: 'Modificador de Prueba',
    price: 10.00,
    quantity: 1,
    type: 'OPTIONAL',
    ...overrides
  };
};

// Factory para clientes
export const createMockCustomer = (overrides = {}) => {
  return {
    id: 'customer_' + Math.random().toString(36).substr(2, 9),
    name: 'Cliente de Prueba',
    email: 'cliente@prueba.com',
    phone: '555-123-4567',
    address: 'Dirección de Prueba 123',
    city: 'Ciudad de Prueba',
    state: 'Estado de Prueba',
    zipCode: '12345',
    country: 'México',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides
  };
};

// Factory para usuarios
export const createMockUser = (overrides = {}) => {
  return {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    username: 'usuario_prueba',
    email: 'usuario@prueba.com',
    firstName: 'Usuario',
    lastName: 'Prueba',
    role: 'CASHIER',
    permissions: ['READ_PRODUCTS', 'CREATE_ORDERS'],
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides
  };
};

// Factory para terminales
export const createMockTerminal = (overrides = {}) => {
  return {
    id: 'term_' + Math.random().toString(36).substr(2, 9),
    name: 'Terminal de Prueba',
    code: 'TERM-TEST',
    location: 'Área de Prueba',
    isActive: true,
    currentUser: null,
    lastActivity: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides
  };
};

// Factory para KDS tickets
export const createMockKdsTicket = (overrides = {}) => {
  const items = overrides.items || [createMockCartItem()];
  
  return {
    id: 'kds_' + Math.random().toString(36).substr(2, 9),
    orderId: 'order_' + Math.random().toString(36).substr(2, 9),
    orderFolio: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    items,
    status: 'PENDING',
    priority: 'NORMAL',
    estimatedTime: 15,
    actualTime: null,
    station: 'COCINA',
    createdAt: new Date(),
    updatedAt: new Date(),
    startedAt: null,
    completedAt: null,
    ...overrides
  };
};

// Factory para reportes
export const createMockReport = (overrides = {}) => {
  return {
    id: 'report_' + Math.random().toString(36).substr(2, 9),
    name: 'Reporte de Prueba',
    type: 'SALES',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    data: {
      totalSales: 50000.00,
      totalOrders: 200,
      averageOrderValue: 250.00,
      topProducts: [],
      paymentMethods: {},
      ...overrides.data
    },
    generatedAt: new Date(),
    generatedBy: 'user_1',
    ...overrides
  };
};

// Factory para notificaciones
export const createMockNotification = (overrides = {}) => {
  return {
    id: 'notif_' + Math.random().toString(36).substr(2, 9),
    title: 'Notificación de Prueba',
    message: 'Este es un mensaje de prueba',
    type: 'INFO',
    priority: 'NORMAL',
    isRead: false,
    userId: 'user_1',
    createdAt: new Date(),
    readAt: null,
    ...overrides
  };
};

// Helper para crear arrays de datos
export const createMockProducts = (count = 5, overrides = {}) => {
  return Array.from({ length: count }, (_, index) => 
    createMockProduct({
      name: `Producto ${index + 1}`,
      price: 50 + (index * 10),
      ...overrides
    })
  );
};

export const createMockOrders = (count = 5, overrides = {}) => {
  return Array.from({ length: count }, (_, index) => 
    createMockOrder({
      folio: `ORD-${String(index + 1).padStart(3, '0')}`,
      ...overrides
    })
  );
};

export const createMockKdsTickets = (count = 5, overrides = {}) => {
  return Array.from({ length: count }, (_, index) => 
    createMockKdsTicket({
      status: index === 0 ? 'ACTIVE' : 'PENDING',
      priority: index === 0 ? 'HIGH' : 'NORMAL',
      ...overrides
    })
  );
};

// Helper para crear datos de API responses
export const createMockApiResponse = (data, overrides = {}) => {
  return {
    success: true,
    data,
    message: 'Success',
    timestamp: new Date().toISOString(),
    ...overrides
  };
};

// Helper para crear errores de API
export const createMockApiError = (message, status = 400, overrides = {}) => {
  return {
    success: false,
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...overrides
  };
};

// Helper para crear paginación
export const createMockPagination = (items, page = 1, limit = 10) => {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};
