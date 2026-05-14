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
import customersRouter from './routes/customers.routes'
import modifierGroupsRouter from './routes/modifierGroups.routes'
import modifiersRouter from './routes/modifiers.routes'
import productVariantsRouter from './routes/productVariants.routes'
import productModifierGroupsRouter from './routes/productModifierGroups.routes'
import themeRouter from './routes/theme.routes'

// Initialize Prisma
const prisma = new PrismaClient()

// Create Express app
const app = express()

// Middleware
app.use(helmet())

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed or matches Vercel pattern
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
app.use('/api/customers', customersRouter)
app.use('/api/modifier-groups', modifierGroupsRouter)
app.use('/api/modifiers', modifiersRouter)
app.use('/api/product-variants', productVariantsRouter)
app.use('/api/product-modifier-groups', productModifierGroupsRouter)
app.use('/api/theme', themeRouter)

// Health check with feature flags
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    features: {
      stations: true,
      modifierGroups: true,
      modifiers: true,
      productVariants: true,
      productModifierAssignments: true
    }
  })
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

    // Users - Admin y Cajero para POS
    await prisma.user.upsert({
      where: { id: 'user-admin' },
      update: {},
      create: {
        id: 'user-admin', username: 'admin', email: 'admin@ycc.com',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
        firstName: 'Administrador', lastName: 'Sistema', role: 'ADMIN'
      }
    })
    await prisma.user.upsert({
      where: { id: 'user-cashier' },
      update: {},
      create: {
        id: 'user-cashier', username: 'cajero', email: 'cajero@ycc.com',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
        firstName: 'Cajero', lastName: 'Principal', role: 'CASHIER'
      }
    })

    // Clean up existing data first to avoid unique constraint conflicts
    await prisma.productVariant.deleteMany({})
    await prisma.product.deleteMany({})
    await prisma.category.deleteMany({})

    // Categories
    await prisma.category.create({ data: { id: 'cat-bebidas', name: 'Bebidas', description: 'Bebidas y refrescos' }})
    await prisma.category.create({ data: { id: 'cat-comida', name: 'Comida', description: 'Platillos principales' }})
    await prisma.category.create({ data: { id: 'cat-postres', name: 'Postres', description: 'Postres y dulces' }})
    await prisma.category.create({ data: { id: 'cat-snacks', name: 'Snacks', description: 'Snacks y botanas' }})

    // Stations (required for products)
    await prisma.station.upsert({
      where: { id: 'station-bar' },
      update: {},
      create: { id: 'station-bar', name: 'bar', displayName: 'Barra', color: '#059669', isActive: true } // Verde Country Club
    })
    await prisma.station.upsert({
      where: { id: 'station-cocina' },
      update: {},
      create: { id: 'station-cocina', name: 'cocina', displayName: 'Cocina', color: '#EF4444', isActive: true }
    })

    // Products - Catálogo completo de 18 productos
    const products = [
      // Bebidas (5 productos) - Barra
      { sku: 'BEB-001', name: 'Coca Cola 600ml', categoryId: 'cat-bebidas', stationId: 'station-bar', price: 35, cost: 18 },
      { sku: 'BEB-002', name: 'Agua Natural 600ml', categoryId: 'cat-bebidas', stationId: 'station-bar', price: 20, cost: 10 },
      { sku: 'BEB-003', name: 'Jugo de Naranja', categoryId: 'cat-bebidas', stationId: 'station-bar', price: 45, cost: 23 },
      { sku: 'BEB-004', name: 'Limonada Natural', categoryId: 'cat-bebidas', stationId: 'station-bar', price: 40, cost: 20 },
      { sku: 'BEB-005', name: 'Cerveza Artesanal', categoryId: 'cat-bebidas', stationId: 'station-bar', price: 85, cost: 43 },
      // Comidas (7 productos) - Cocina
      { sku: 'COM-001', name: 'Hamburguesa Clasica', categoryId: 'cat-comida', stationId: 'station-cocina', price: 145, cost: 73 },
      { sku: 'COM-002', name: 'Club Sandwich', categoryId: 'cat-comida', stationId: 'station-cocina', price: 125, cost: 63 },
      { sku: 'COM-003', name: 'Ensalada Cesar', categoryId: 'cat-comida', stationId: 'station-cocina', price: 110, cost: 55 },
      { sku: 'COM-004', name: 'Tacos de Arrachera (3)', categoryId: 'cat-comida', stationId: 'station-cocina', price: 165, cost: 83 },
      { sku: 'COM-005', name: 'Pizza Margarita', categoryId: 'cat-comida', stationId: 'station-cocina', price: 195, cost: 98 },
      { sku: 'COM-006', name: 'Alitas BBQ (12pz)', categoryId: 'cat-comida', stationId: 'station-cocina', price: 175, cost: 88 },
      { sku: 'COM-007', name: 'Filete de Salmon', categoryId: 'cat-comida', stationId: 'station-cocina', price: 285, cost: 143 },
      // Postres (3 productos) - Cocina
      { sku: 'POS-001', name: 'Pastel de Chocolate', categoryId: 'cat-postres', stationId: 'station-cocina', price: 75, cost: 38 },
      { sku: 'POS-002', name: 'Flan Napolitano', categoryId: 'cat-postres', stationId: 'station-cocina', price: 55, cost: 28 },
      { sku: 'POS-003', name: 'Helado (3 bolas)', categoryId: 'cat-postres', stationId: 'station-cocina', price: 65, cost: 33 },
      // Snacks (3 productos) - Barra
      { sku: 'SNK-001', name: 'Papas Fritas', categoryId: 'cat-snacks', stationId: 'station-bar', price: 55, cost: 28 },
      { sku: 'SNK-002', name: 'Nachos con Queso', categoryId: 'cat-snacks', stationId: 'station-bar', price: 85, cost: 43 },
      { sku: 'SNK-003', name: 'Guacamole con Totopos', categoryId: 'cat-snacks', stationId: 'station-bar', price: 95, cost: 48 }
    ]

    for (const p of products) {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: { 
          name: p.name, 
          categoryId: p.categoryId, 
          stationId: p.stationId,
          price: p.price, 
          cost: p.cost 
        },
        create: { 
          sku: p.sku,
          name: p.name,
          categoryId: p.categoryId,
          stationId: p.stationId,
          price: p.price,
          cost: p.cost,
          currentStock: 100, 
          minStockLevel: 10 
        }
      })
    }

    // Productos con variantes - EJEMPLOS CON VERSIONES/TIPOS
    // Las variantes pueden ser: tamaño (355ml, 600ml), tipo (Light, Zero), o combinadas
    const variantProducts = [
      {
        sku: 'VAR-001',
        name: 'Coca-Cola',
        categoryId: 'cat-bebidas',
        stationId: 'station-bar',
        hasVariants: true,
        variantLabel: 'Presentación',
        price: 35,
        variants: [
          // Lata 355ml - diferentes versiones
          { name: '355ml Normal', price: 35, sku: 'VAR-001-355-N', sortOrder: 1, description: 'Sabor original' },
          { name: '355ml Light', price: 35, sku: 'VAR-001-355-L', sortOrder: 2, description: 'Sin azúcar' },
          { name: '355ml Zero', price: 35, sku: 'VAR-001-355-Z', sortOrder: 3, description: 'Zero azúcar' },
          // Botella 600ml - diferentes versiones
          { name: '600ml Normal', price: 45, sku: 'VAR-001-600-N', sortOrder: 4, description: 'Sabor original' },
          { name: '600ml Light', price: 45, sku: 'VAR-001-600-L', sortOrder: 5, description: 'Sin azúcar' },
          { name: '600ml Zero', price: 45, sku: 'VAR-001-600-Z', sortOrder: 6, description: 'Zero azúcar' },
          // Botella 1.5L - solo normal
          { name: '1.5L Normal', price: 65, sku: 'VAR-001-15L-N', sortOrder: 7, description: 'Sabor original' }
        ]
      },
      {
        sku: 'VAR-002',
        name: 'Hamburguesa Especial',
        categoryId: 'cat-comida',
        stationId: 'station-cocina',
        hasVariants: true,
        variantLabel: 'Presentación',
        price: 145,
        variants: [
          { name: 'Sencilla', price: 145, sku: 'VAR-002-SEN', sortOrder: 1, description: '1 carne, verduras' },
          { name: 'Doble Carne', price: 185, sku: 'VAR-002-DOB', sortOrder: 2, description: '2 carnes, doble queso' },
          { name: 'Triple + Tocino', price: 225, sku: 'VAR-002-TRI', sortOrder: 3, description: '3 carnes, tocino crispy' },
          { name: 'Vegetariana', price: 135, sku: 'VAR-002-VEG', sortOrder: 4, description: 'Hamburguesa de portobello' }
        ]
      },
      {
        sku: 'VAR-003',
        name: 'Café Americano',
        categoryId: 'cat-bebidas',
        stationId: 'station-bar',
        hasVariants: true,
        variantLabel: 'Tamaño',
        price: 45,
        variants: [
          { name: 'Chico 8oz', price: 45, sku: 'VAR-003-CH', sortOrder: 1, description: '240ml' },
          { name: 'Mediano 12oz', price: 55, sku: 'VAR-003-MD', sortOrder: 2, description: '360ml' },
          { name: 'Grande 16oz', price: 65, sku: 'VAR-003-GR', sortOrder: 3, description: '480ml' },
          { name: 'Térmico 20oz', price: 75, sku: 'VAR-003-TR', sortOrder: 4, description: '600ml + $10 termo' }
        ]
      }
    ]

    // Crear productos con variantes
    for (const vp of variantProducts) {
      const { variants, ...productData } = vp
      
      const product = await prisma.product.upsert({
        where: { sku: productData.sku },
        update: {
          name: productData.name,
          categoryId: productData.categoryId,
          stationId: productData.stationId,
          hasVariants: true,
          variantLabel: productData.variantLabel,
          price: productData.price,
          currentStock: 100
        },
        create: {
          sku: productData.sku,
          name: productData.name,
          categoryId: productData.categoryId,
          stationId: productData.stationId,
          hasVariants: true,
          variantLabel: productData.variantLabel,
          price: productData.price,
          currentStock: 100
        }
      })

      // Crear variantes para este producto
      for (const variant of variants) {
        await prisma.productVariant.upsert({
          where: { sku: variant.sku },
          update: {
            name: variant.name,
            price: variant.price,
            sortOrder: variant.sortOrder,
            description: variant.description || null,
            currentStock: 50
          },
          create: {
            productId: product.id,
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            sortOrder: variant.sortOrder,
            description: variant.description || null,
            currentStock: 50
          }
        })
      }
    }

    // Crear grupos de modificadores (ingredientes extras, sin cebolla, etc.)
    const modifierGroups = [
      {
        name: 'Ingredientes Extra',
        description: 'Agrega ingredientes extra a tu platillo',
        isRequired: false,
        modifiers: [
          { name: 'Extra Queso', priceAdd: 25, description: '+30g queso manchego' },
          { name: 'Extra Carne', priceAdd: 45, description: '+50g de carne' },
          { name: 'Extra Tocino', priceAdd: 30, description: '+2 tiras de tocino crispy' },
          { name: 'Extra Aguacate', priceAdd: 35, description: '+1/2 aguacate' },
          { name: 'Guacamole', priceAdd: 20, description: 'Porción de guacamole' }
        ]
      },
      {
        name: 'Sin / Quitar',
        description: 'Quita ingredientes de tu platillo',
        isRequired: false,
        modifiers: [
          { name: 'Sin Cebolla', priceAdd: 0, description: 'Sin cebolla' },
          { name: 'Sin Tomate', priceAdd: 0, description: 'Sin tomate' },
          { name: 'Sin Mayonesa', priceAdd: 0, description: 'Sin mayonesa' },
          { name: 'Sin Mostaza', priceAdd: 0, description: 'Sin mostaza' },
          { name: 'Sin Cilantro', priceAdd: 0, description: 'Sin cilantro' }
        ]
      },
      {
        name: 'Término de Carne',
        description: 'Selecciona cómo quieres tu carne',
        isRequired: false,
        modifiers: [
          { name: 'Término Medio', priceAdd: 0, description: 'Rosado en centro' },
          { name: 'Tres Cuartos', priceAdd: 0, description: 'Ligeramente rosado' },
          { name: 'Bien Cocida', priceAdd: 0, description: 'Sin rosa' }
        ]
      },
      {
        name: 'Salsas',
        description: 'Selecciona tus salsas',
        isRequired: false,
        modifiers: [
          { name: 'Salsa Roja', priceAdd: 0, description: 'Salsa picante roja' },
          { name: 'Salsa Verde', priceAdd: 0, description: 'Salsa picante verde' },
          { name: 'Salsa Habanero', priceAdd: 0, description: 'Salsa extra picante' },
          { name: 'Aderezo Ranch', priceAdd: 10, description: 'Aderezo ranch' }
        ]
      }
    ]

    for (const mg of modifierGroups) {
      const { modifiers, ...groupData } = mg
      const group = await prisma.modifierGroup.upsert({
        where: { name: groupData.name },
        update: { description: groupData.description, isRequired: groupData.isRequired },
        create: { name: groupData.name, description: groupData.description, isRequired: groupData.isRequired }
      })

      for (const mod of modifiers) {
        await prisma.modifier.upsert({
          where: { id: `${group.id}-${mod.name.replace(/\s+/g, '-').toLowerCase()}` },
          update: { name: mod.name, description: mod.description, priceAdd: mod.priceAdd },
          create: {
            id: `${group.id}-${mod.name.replace(/\s+/g, '-').toLowerCase()}`,
            modifierGroupId: group.id,
            name: mod.name,
            description: mod.description,
            priceAdd: mod.priceAdd
          }
        })
      }
    }

    // Conectar grupos de modificadores a productos de comida
    const comidaProducts = await prisma.product.findMany({
      where: { categoryId: 'cat-comida' },
      select: { id: true, sku: true }
    })
    const allModifierGroups = await prisma.modifierGroup.findMany({ select: { id: true, name: true } })
    
    // Mapear qué grupos aplican a qué tipo de producto
    for (const product of comidaProducts) {
      const applicableGroups = allModifierGroups.filter(g => {
        if (product.sku === 'COM-007') {
          // Salmón: solo término de carne y salsas (no ingredientes extra ni quitar)
          return g.name === 'Término de Carne' || g.name === 'Salsas'
        }
        if (product.sku === 'COM-003') {
          // Ensalada: sin término de carne
          return g.name !== 'Término de Carne'
        }
        // Hamburguesa, Club Sandwich, Tacos, Pizza, Alitas: todos los grupos
        return true
      })

      for (const group of applicableGroups) {
        await prisma.productModifierGroup.upsert({
          where: { productId_modifierGroupId: { productId: product.id, modifierGroupId: group.id } },
          update: {},
          create: { productId: product.id, modifierGroupId: group.id }
        })
      }
    }

    // Conectar algunos modificadores a snacks (salsas)
    const snackProducts = await prisma.product.findMany({
      where: { categoryId: 'cat-snacks' },
      select: { id: true, sku: true }
    })
    const salsasGroup = allModifierGroups.find(g => g.name === 'Salsas')
    if (salsasGroup) {
      for (const product of snackProducts) {
        await prisma.productModifierGroup.upsert({
          where: { productId_modifierGroupId: { productId: product.id, modifierGroupId: salsasGroup.id } },
          update: {},
          create: { productId: product.id, modifierGroupId: salsasGroup.id }
        })
      }
    }

    // Conectar modificadores a productos con variantes (Hamburguesa Especial ya tiene modifiers por cat-comida)
    // Café Americano: solo salsas no aplica, pero podríamos agregar "Tamaño" como variante ya lo tiene
    // No agregamos modifiers a bebidas simples

    const count = await prisma.product.count()
    const variantCount = await prisma.productVariant.count()
    const modifierGroupCount = await prisma.modifierGroup.count()
    const modifierCount = await prisma.modifier.count()
    const productModifierCount = await prisma.productModifierGroup.count()
    res.json({ success: true, message: 'Datos inicializados con variantes y modificadores', productCount: count, variantCount, modifierGroupCount, modifierCount, productModifierCount })
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
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
})

// ============================================
// USER ACTIVITY TRACKING (Online/Offline Status)
// ============================================
interface UserActivity {
  userId: string
  username: string
  firstName: string
  lastName: string
  role: string
  isOnline: boolean
  lastSeen: Date
  currentModule: 'POS' | 'KDS' | 'ADMIN' | null
  socketId: string | null
  loginTime?: Date
}

// In-memory store for user activity
const userActivityMap = new Map<string, UserActivity>()

// Function to get all users activity status
export const getUsersActivity = () => {
  return Array.from(userActivityMap.values())
}

// Function to update user activity
export const updateUserActivity = (userId: string, activity: Partial<UserActivity>) => {
  const existing = userActivityMap.get(userId)
  if (existing) {
    userActivityMap.set(userId, { ...existing, ...activity, lastSeen: new Date() })
  } else {
    userActivityMap.set(userId, {
      userId,
      username: activity.username || '',
      firstName: activity.firstName || '',
      lastName: activity.lastName || '',
      role: activity.role || '',
      isOnline: activity.isOnline ?? false,
      lastSeen: new Date(),
      currentModule: activity.currentModule || null,
      socketId: activity.socketId || null,
      loginTime: activity.loginTime
    })
  }
}

// Function to set user offline
export const setUserOffline = (socketId: string) => {
  for (const [userId, activity] of userActivityMap.entries()) {
    if (activity.socketId === socketId) {
      userActivityMap.set(userId, {
        ...activity,
        isOnline: false,
        currentModule: null,
        socketId: null,
        lastSeen: new Date()
      })
      console.log(`👤 Usuario ${activity.username} marcado como OFFLINE`)
      // Broadcast updated activity to all clients
      io.emit('user:activity:updated', getUsersActivity())
      break
    }
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`)

  // User login tracking
  socket.on('user:login', (data: { userId: string; username: string; firstName: string; lastName: string; role: string; module: 'POS' | 'KDS' | 'ADMIN' }) => {
    console.log(`👤 Usuario conectado: ${data.username} (${data.module})`)
    updateUserActivity(data.userId, {
      ...data,
      currentModule: data.module,
      isOnline: true,
      socketId: socket.id,
      loginTime: new Date()
    })
    // Broadcast updated activity to all clients
    io.emit('user:activity:updated', getUsersActivity())
  })

  // User module change
  socket.on('user:module:change', (data: { userId: string; module: 'POS' | 'KDS' | 'ADMIN' | null }) => {
    const activity = userActivityMap.get(data.userId)
    if (activity) {
      activity.currentModule = data.module
      activity.lastSeen = new Date()
      userActivityMap.set(data.userId, activity)
      io.emit('user:activity:updated', getUsersActivity())
    }
  })

  // User heartbeat (ping)
  socket.on('user:heartbeat', (data: { userId: string }) => {
    const activity = userActivityMap.get(data.userId)
    if (activity) {
      activity.lastSeen = new Date()
      userActivityMap.set(data.userId, activity)
    }
  })

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
    setUserOffline(socket.id)
  })
  
  // Alertas: obtener lista inicial
  socket.on('alerts:get', () => {
    socket.emit('alerts:list', getAlerts())
  })
  
  // Alertas: marcar como leída
  socket.on('alert:acknowledge', (alertId: string) => {
    acknowledgeAlert(alertId)
  })
})

// ========================================
// ALERTAS EN TIEMPO REAL
// ========================================
interface Alert {
  id: string
  type: 'warning' | 'success' | 'info' | 'error'
  title: string
  message: string
  timestamp: Date
  acknowledged: boolean
  source?: 'POS' | 'KDS' | 'INVENTORY' | 'SYSTEM'
  metadata?: any
}

const alertsMap = new Map<string, Alert>()

// Función para crear una nueva alerta
function createAlert(data: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): Alert {
  const alert: Alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: data.type,
    title: data.title,
    message: data.message,
    timestamp: new Date(),
    acknowledged: false,
    source: data.source,
    metadata: data.metadata
  }
  alertsMap.set(alert.id, alert)
  
  // Emitir a todos los clientes conectados
  io.emit('alert:new', alert)
  console.log(`🔔 Nueva alerta: ${alert.title} (${alert.type})`)
  
  // Limitar a máximo 50 alertas
  if (alertsMap.size > 50) {
    const oldestKey = Array.from(alertsMap.keys())[0]
    alertsMap.delete(oldestKey)
  }
  
  return alert
}

// Función para obtener todas las alertas
function getAlerts(): Alert[] {
  return Array.from(alertsMap.values()).sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  )
}

// Función para marcar alerta como leída
function acknowledgeAlert(alertId: string): boolean {
  const alert = alertsMap.get(alertId)
  if (alert) {
    alert.acknowledged = true
    alertsMap.set(alertId, alert)
    io.emit('alert:updated', alert)
    return true
  }
  return false
}

// Función para limpiar alertas antiguas (más de 24 horas)
function cleanOldAlerts() {
  const now = new Date()
  const oneDay = 24 * 60 * 60 * 1000
  
  for (const [id, alert] of alertsMap) {
    if (now.getTime() - alert.timestamp.getTime() > oneDay) {
      alertsMap.delete(id)
    }
  }
}

// Limpiar alertas antiguas cada hora
setInterval(cleanOldAlerts, 60 * 60 * 1000)

// Make user activity and alerts available to routes
app.set('userActivity', { getUsersActivity, updateUserActivity })
app.set('alerts', { createAlert, getAlerts, acknowledgeAlert })

// Exponer Socket.io para que esté disponible en los routers
app.set('io', io)

httpServer.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔌 Database connected: ${prisma ? 'Yes' : 'No'}`)
  console.log(`⚡ Socket.io ready for real-time communication`)
})

// Export app for integration tests
export { app }

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})
