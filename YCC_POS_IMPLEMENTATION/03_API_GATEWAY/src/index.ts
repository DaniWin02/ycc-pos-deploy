import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import productsRouter from './routes/products.routes'
import categoriesRouter from './routes/categories.routes'
import usersRouter from './routes/users.routes'
import comandasRouter from './routes/comandas.routes.enhanced'
import inventoryRouter from './routes/inventory.routes'
import recipesRouter from './routes/recipes.routes'
import authRouter from './routes/auth.routes'
import cashSessionsRouter from './routes/cashSessions.routes'
import shiftsRouter from './routes/shifts.routes'
import cashMovementsRouter from './routes/cashMovements.routes'
import salesRouter from './routes/sales.routes'
import systemRouter from './routes/system.routes'
import ordersRouter from './routes/orders.routes'
import stationsRouter from './routes/stations.routes'
import orderItemsRouter from './routes/orderItems.routes'
import suppliersRouter from './routes/suppliers.routes'
import purchaseOrdersRouter from './routes/purchaseOrders.routes'
import physicalCountsRouter from './routes/physicalCounts.routes'
import wasteRouter from './routes/waste.routes'

// Initialize Prisma
const prisma = new PrismaClient()

// Create Express app
const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
// Aumentar límite para permitir imágenes en base64 (hasta 10MB)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware - Mejorado para debugging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`)
  next()
})

// API Routes - TODAS con prefijo /api para consistencia
app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/users', usersRouter)
app.use('/api/comandas', comandasRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/recipes', recipesRouter)
app.use('/api/auth', authRouter)
app.use('/api/cash-sessions', cashSessionsRouter)
app.use('/api/shifts', shiftsRouter)
app.use('/api/cash-movements', cashMovementsRouter)
app.use('/api/sales', salesRouter)
app.use('/api/system', systemRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/stations', stationsRouter)
app.use('/api/order-items', orderItemsRouter)
app.use('/api/suppliers', suppliersRouter)
app.use('/api/purchase-orders', purchaseOrdersRouter)
app.use('/api/physical-counts', physicalCountsRouter)
app.use('/api/waste', wasteRouter)

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

// Handle preflight for /api/sales
app.options('/api/sales', cors())

// NOTE: The POST /api/sales handler is in sales.routes.ts (registered above)
// GET /api/sales is also in sales.routes.ts - removed duplicate inline handler

// 404 handler - DEBE ir antes del error handler
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    message: `Cannot ${req.method} ${req.path}`
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// Start server with Socket.io
const PORT = process.env.PORT || 3004
const httpServer = createServer(app)

// Initialize Socket.io
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true
  }
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`)

  socket.on('join-station', (station: string) => {
    socket.join(`station-${station}`)
    console.log(`👨‍🍳 Cliente ${socket.id} se unió a estación: ${station}`)
  })

  socket.on('leave-station', (station: string) => {
    socket.leave(`station-${station}`)
    console.log(`👋 Cliente ${socket.id} salió de estación: ${station}`)
  })

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`)
  })
})

// Exponer Socket.io para que esté disponible en los routers
app.set('io', io)

httpServer.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔌 Database connected: ${prisma ? 'Yes' : 'No'}`)
  console.log(`⚡ Socket.io ready for real-time communication`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})
