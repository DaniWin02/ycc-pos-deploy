import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import { AuthService } from './services/auth.service'
import { SalesService } from './services/sales.service'
import { InventoryService } from './services/inventory.service'
import { RecipeCostService } from './services/recipe-cost.service'
import { BomResolverService } from './services/bom-resolver.service'
import logger, { httpLogger, requestLogger, errorLogger } from './utils/logger'
import { requestTracker } from './services/monitoring.service'
import monitoringRoutes from './routes/monitoring.routes'

// Initialize Prisma
const prisma = new PrismaClient()

// Initialize services
const authService = new AuthService(prisma)
const salesService = new SalesService(prisma)
const inventoryService = new InventoryService(prisma)
const recipeCostService = new RecipeCostService(prisma)
const bomResolverService = new BomResolverService(prisma)

// Create Express app
const app = express()

// Global error handler
const globalErrorHandler = (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Unhandled error: ${error.message}`, {
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
}

// Performance monitoring middleware
const performanceMonitor = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = process.hrtime.bigint()

  res.on('finish', () => {
    const end = process.hrtime.bigint()
    const duration = Number(end - start) / 1000000 // Convert to milliseconds

    // Log slow requests (>500ms)
    if (duration > 500) {
      logger.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`, {
        duration,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      })
    }
  })

  next()
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/ready'
  }
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression middleware
app.use(compression())

// Logging middleware
app.use(httpLogger)
app.use(requestLogger)

// Performance monitoring
app.use(performanceMonitor)

// Request tracking for metrics
app.use(requestTracker)

// Health check endpoint (public)
app.get('/health', async (req, res) => {
  try {
    // Quick database check
    await prisma.$queryRaw`SELECT 1`

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    })
  } catch (error) {
    logger.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database connection failed'
    })
  }
})

// Monitoring routes
app.use('/api/monitoring', monitoringRoutes)

// Auth routes
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const userData = req.body
    const result = await authService.register(userData)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    const result = await authService.refreshToken(refreshToken)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

app.get('/api/auth/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const result = await authService.verifyToken(token)
    const user = await authService.getUserById(result.userId)
    res.json(user)
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const result = await authService.verifyToken(token)
    await authService.logout(result.userId)
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
})

// Middleware for authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const result = await authService.verifyToken(token)
    req.user = result
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Middleware for role-based access
const requireRole = (requiredRole: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const hasPermission = await authService.hasRole(req.user.userId, requiredRole)
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
      next()
    } catch (error) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
  }
}

// Menu/Product routes
app.get('/api/menu/products', authenticateToken, async (req, res, next) => {
  try {
    const { category } = req.query
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as string })
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        sku: true,
        stock: true,
        imageUrl: true
      },
      orderBy: { name: 'asc' }
    })
    res.json(products)
  } catch (error) {
    next(error)
  }
})

app.get('/api/menu/products/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        cost: true,
        category: true,
        sku: true,
        stock: true,
        minStock: true,
        imageUrl: true,
        isActive: true
      }
    })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json(product)
  } catch (error) {
    next(error)
  }
})

app.post('/api/menu/products', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const productData = req.body
    const product = await prisma.product.create({
      data: {
        ...productData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
})

app.put('/api/menu/products/:id', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json(product)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/menu/products/:id', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json({ message: 'Product deactivated successfully' })
  } catch (error) {
    next(error)
  }
})

// Sales routes
app.post('/api/sales', authenticateToken, async (req, res, next) => {
  try {
    const saleData = req.body
    const sale = await salesService.createSale({
      ...saleData,
      userId: req.user.userId
    })
    res.status(201).json(sale)
  } catch (error) {
    next(error)
  }
})

app.get('/api/sales', authenticateToken, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const sales = await salesService.getSalesByPeriod(
      req.user.userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    )
    res.json(sales)
  } catch (error) {
    next(error)
  }
})

app.post('/api/sales/:id/cancel', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const sale = await salesService.cancelSale(id, reason)
    res.json(sale)
  } catch (error) {
    next(error)
  }
})

app.get('/api/sales/stats', authenticateToken, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const stats = await salesService.getSalesStats(
      startDate ? new Date(startDate as string) : new Date(),
      endDate ? new Date(endDate as string) : new Date()
    )
    res.json(stats)
  } catch (error) {
    next(error)
  }
})

// Inventory routes
app.get('/api/inventory/value', authenticateToken, async (req, res, next) => {
  try {
    const value = await inventoryService.getInventoryValue()
    res.json(value)
  } catch (error) {
    next(error)
  }
})

app.get('/api/inventory/low-stock', authenticateToken, async (req, res, next) => {
  try {
    const { threshold } = req.query
    const lowStock = await inventoryService.getLowStockProducts(
      threshold ? parseInt(threshold as string) : undefined
    )
    res.json(lowStock)
  } catch (error) {
    next(error)
  }
})

app.post('/api/inventory/update-cost', authenticateToken, async (req, res, next) => {
  try {
    const { productId, newQuantity, newCost } = req.body
    const result = await inventoryService.updateAverageCost(productId, newQuantity, newCost)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

app.get('/api/inventory/movements', authenticateToken, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const movements = await inventoryService.getInventoryMovements(
      new Date(startDate as string),
      new Date(endDate as string)
    )
    res.json(movements)
  } catch (error) {
    next(error)
  }
})

app.get('/api/inventory/fast-moving', authenticateToken, async (req, res, next) => {
  try {
    const { startDate, endDate, limit } = req.query
    const products = await inventoryService.getFastMovingProducts(
      new Date(startDate as string),
      new Date(endDate as string),
      limit ? parseInt(limit as string) : 10
    )
    res.json(products)
  } catch (error) {
    next(error)
  }
})

// Recipe Cost routes
app.get('/api/recipes/:id/cost', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params
    const cost = await recipeCostService.calculateRecipeCost(id)
    res.json(cost)
  } catch (error) {
    next(error)
  }
})

app.get('/api/recipes/cost', authenticateToken, async (req, res, next) => {
  try {
    const { recipeIds } = req.query
    const ids = (recipeIds as string)?.split(',').filter(Boolean)
    const costs = await recipeCostService.calculateMultipleRecipesCost(ids || [])
    res.json(costs)
  } catch (error) {
    next(error)
  }
})

// BOM Resolver routes
app.get('/api/bom/:recipeId/resolve', authenticateToken, async (req, res, next) => {
  try {
    const { recipeId } = req.params
    const { quantity } = req.query
    const bom = await bomResolverService.resolveBom(
      recipeId,
      quantity ? parseFloat(quantity as string) : 1
    )
    res.json(bom)
  } catch (error) {
    next(error)
  }
})

// Reports routes
app.get('/api/reports/sales', authenticateToken, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const report = await salesService.getSalesByPeriod(
      req.user.userId,
      startDate ? new Date(startDate as string) : new Date(),
      endDate ? new Date(endDate as string) : new Date()
    )
    res.json(report)
  } catch (error) {
    next(error)
  }
})

app.get('/api/reports/inventory', authenticateToken, async (req, res, next) => {
  try {
    const value = await inventoryService.getInventoryValue()
    const lowStock = await inventoryService.getLowStockProducts()
    
    res.json({
      ...value,
      lowStockProducts: lowStock,
      fastMovingProducts: [], // Would need sales data
      movements: [] // Would need sales data
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/reports/dashboard', authenticateToken, async (req, res, next) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))
    
    const todaySales = await salesService.getSalesByPeriod(req.user.userId, startOfDay, endOfDay)
    const inventoryValue = await inventoryService.getInventoryValue()
    const lowStockCount = (await inventoryService.getLowStockProducts()).length
    
    res.json({
      todaySales: todaySales.length,
      todayRevenue: todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      totalProducts: inventoryValue.totalProducts,
      lowStockCount,
      recentSales: todaySales.slice(-5),
      topProducts: [] // Would need sales aggregation
    })
  } catch (error) {
    next(error)
  }
})

// Error logging middleware
app.use(errorLogger)

// Global error handler (must be last)
app.use(globalErrorHandler)

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ error: 'Route not found' })
})

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`)

  try {
    // Close database connections
    await prisma.$disconnect()
    logger.info('Database connections closed')

    // Close Redis connections if any
    if (global.redisClient) {
      await global.redisClient.disconnect()
      logger.info('Redis connections closed')
    }

    process.exit(0)
  } catch (error) {
    logger.error('Error during graceful shutdown:', error)
    process.exit(1)
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  logger.info(`🚀 YCC POS API Gateway running on port ${PORT}`)
  logger.info(`📊 Health check: http://localhost:${PORT}/health`)
  logger.info(`📈 Metrics: http://localhost:${PORT}/api/monitoring/metrics`)
  logger.info(`🔍 Status: http://localhost:${PORT}/api/monitoring/status`)
})

export default app
