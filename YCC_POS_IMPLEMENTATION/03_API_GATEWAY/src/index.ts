import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { PrismaClient } from '@prisma/client'
import productsRouter from './routes/products.routes'
import categoriesRouter from './routes/categories.routes'
import usersRouter from './routes/users.routes'
import comandasRouter from './routes/comandas.routes'
import inventoryRouter from './routes/inventory.routes'
import recipesRouter from './routes/recipes.routes'
import authRouter from './routes/auth.routes'

// Initialize Prisma
const prisma = new PrismaClient()

// Create Express app
const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/products', productsRouter)
app.use('/categories', categoriesRouter)
app.use('/users', usersRouter)
app.use('/comandas', comandasRouter)
app.use('/inventory', inventoryRouter)
app.use('/recipes', recipesRouter)
app.use('/auth', authRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Initialize test data (GET for easy browser access)
app.get('/api/init-data', async (req, res) => {
  try {
    // Store
    await prisma.store.upsert({
      where: { id: 'store-1' },
      update: {},
      create: { id: 'store-1', name: 'YCC Main Store', address: 'Av. Principal 123', phone: '555-1234' }
    })

    // Terminal
    await prisma.terminal.upsert({
      where: { id: 'terminal-1' },
      update: {},
      create: { id: 'terminal-1', storeId: 'store-1', name: 'Terminal 1', location: 'Main Counter' }
    })

    // User
    await prisma.user.upsert({
      where: { id: 'user-1' },
      update: {},
      create: {
        id: 'user-1', username: 'admin', email: 'admin@ycc.com',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
        firstName: 'Admin', lastName: 'User', role: 'ADMIN'
      }
    })

    // Categories
    await prisma.category.upsert({
      where: { id: 'cat-bebidas' },
      update: {},
      create: { id: 'cat-bebidas', name: 'Bebidas', description: 'Bebidas y refrescos' }
    })
    await prisma.category.upsert({
      where: { id: 'cat-comida' },
      update: {},
      create: { id: 'cat-comida', name: 'Comida', description: 'Platillos principales' }
    })
    await prisma.category.upsert({
      where: { id: 'cat-postres' },
      update: {},
      create: { id: 'cat-postres', name: 'Postres', description: 'Postres y dulces' }
    })

    // Crear categoría Snacks si no existe
    await prisma.category.upsert({
      where: { id: 'cat-snacks' },
      update: {},
      create: { id: 'cat-snacks', name: 'Snacks', description: 'Snacks y botanas' }
    })

    // Products - Catálogo completo de 18 productos
    const products = [
      // Bebidas (5 productos)
      { sku: 'BEB-001', name: 'Coca Cola 600ml', categoryId: 'cat-bebidas', price: 35, cost: 18 },
      { sku: 'BEB-002', name: 'Agua Natural 600ml', categoryId: 'cat-bebidas', price: 20, cost: 10 },
      { sku: 'BEB-003', name: 'Jugo de Naranja', categoryId: 'cat-bebidas', price: 45, cost: 23 },
      { sku: 'BEB-004', name: 'Limonada Natural', categoryId: 'cat-bebidas', price: 40, cost: 20 },
      { sku: 'BEB-005', name: 'Cerveza Artesanal', categoryId: 'cat-bebidas', price: 85, cost: 43 },
      // Comidas (7 productos)
      { sku: 'COM-001', name: 'Hamburguesa Clasica', categoryId: 'cat-comida', price: 145, cost: 73 },
      { sku: 'COM-002', name: 'Club Sandwich', categoryId: 'cat-comida', price: 125, cost: 63 },
      { sku: 'COM-003', name: 'Ensalada Cesar', categoryId: 'cat-comida', price: 110, cost: 55 },
      { sku: 'COM-004', name: 'Tacos de Arrachera (3)', categoryId: 'cat-comida', price: 165, cost: 83 },
      { sku: 'COM-005', name: 'Pizza Margarita', categoryId: 'cat-comida', price: 195, cost: 98 },
      { sku: 'COM-006', name: 'Alitas BBQ (12pz)', categoryId: 'cat-comida', price: 175, cost: 88 },
      { sku: 'COM-007', name: 'Filete de Salmon', categoryId: 'cat-comida', price: 285, cost: 143 },
      // Postres (3 productos)
      { sku: 'POS-001', name: 'Pastel de Chocolate', categoryId: 'cat-postres', price: 75, cost: 38 },
      { sku: 'POS-002', name: 'Flan Napolitano', categoryId: 'cat-postres', price: 55, cost: 28 },
      { sku: 'POS-003', name: 'Helado (3 bolas)', categoryId: 'cat-postres', price: 65, cost: 33 },
      // Snacks (3 productos)
      { sku: 'SNK-001', name: 'Papas Fritas', categoryId: 'cat-snacks', price: 55, cost: 28 },
      { sku: 'SNK-002', name: 'Nachos con Queso', categoryId: 'cat-snacks', price: 85, cost: 43 },
      { sku: 'SNK-003', name: 'Guacamole con Totopos', categoryId: 'cat-snacks', price: 95, cost: 48 }
    ]

    for (const p of products) {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: { 
          name: p.name, 
          categoryId: p.categoryId, 
          price: p.price, 
          cost: p.cost 
        },
        create: { 
          sku: p.sku,
          name: p.name,
          categoryId: p.categoryId,
          price: p.price,
          cost: p.cost,
          currentStock: 100, 
          minStockLevel: 10 
        }
      })
    }

    const count = await prisma.product.count()
    res.json({ success: true, message: 'Datos inicializados', productCount: count })
  } catch (error: any) {
    console.error('Error initializing data:', error)
    res.status(500).json({ error: error.message })
  }
})

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true }
    })
    res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

app.post('/api/sales', async (req, res) => {
  try {
    const { items, customerId, customerName, totalAmount, paymentMethod, notes } = req.body
    
    // Get real IDs from database
    const terminal = await prisma.terminal.findFirst({ where: { isActive: true } })
    const store = await prisma.store.findFirst({ where: { isActive: true } })
    const user = await prisma.user.findFirst({ where: { isActive: true } })
    
    if (!terminal || !store || !user) {
      return res.status(500).json({ error: 'Missing required configuration' })
    }
    
    // Calculate tax (16%)
    const taxAmount = Number(totalAmount) * 0.16
    const subtotal = Number(totalAmount) - taxAmount
    
    // Create order
    const order = await prisma.order.create({
      data: {
        folio: `ORD-${Date.now().toString(36).toUpperCase()}`,
        customerId,
        customerName: customerName || 'Guest',
        terminalId: terminal.id,
        storeId: store.id,
        createdByUserId: user.id,
        status: 'COMPLETED',
        subtotal,
        taxAmount,
        totalAmount: Number(totalAmount),
        paymentStatus: 'CAPTURED',
        notes,
        completedAt: new Date(),
        items: {
          create: items.map((item: any) => {
            const itemTotal = item.price * item.quantity
            const itemTax = itemTotal * 0.16
            return {
              productId: item.productId,
              productName: item.name,
              sku: item.sku || 'SKU-' + item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: itemTotal,
              taxRate: 0.16,
              taxAmount: itemTax,
              modifiers: JSON.stringify([])
            }
          })
        },
        payments: {
          create: {
            method: paymentMethod || 'CASH',
            amount: Number(totalAmount),
            status: 'CAPTURED',
            capturedAt: new Date()
          }
        }
      },
      include: {
        items: true,
        payments: true,
        customer: true
      }
    })
    
    res.json(order)
  } catch (error) {
    console.error('Error creating sale:', error)
    res.status(500).json({ error: 'Failed to create sale', details: error.message })
  }
})

app.get('/api/sales', async (req, res) => {
  try {
    const sales = await prisma.order.findMany({
      include: {
        items: true,
        payments: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    res.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    res.status(500).json({ error: 'Failed to fetch sales' })
  }
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// Start server
const PORT = process.env.PORT || 3004
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔌 Database connected: ${prisma ? 'Yes' : 'No'}`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})
