import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { createClient } from 'redis'
import logger from '../utils/logger'

const prisma = new PrismaClient()

// Health check status interface
interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  services: {
    database: ServiceStatus
    redis: ServiceStatus
    memory: MemoryStatus
    disk: DiskStatus
  }
  version: string
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded'
  responseTime?: number
  error?: string
}

interface MemoryStatus {
  used: number
  free: number
  total: number
  percentage: number
}

interface DiskStatus {
  used: number
  free: number
  total: number
  percentage: number
}

// Application metrics interface
interface AppMetrics {
  timestamp: string
  uptime: number
  memory: MemoryStatus
  cpu: CPUStatus
  requests: RequestMetrics
  database: DatabaseMetrics
  cache: CacheMetrics
}

interface CPUStatus {
  usage: number
  loadAverage: number[]
}

interface RequestMetrics {
  total: number
  active: number
  averageResponseTime: number
  errorRate: number
  statusCodes: Record<string, number>
}

interface DatabaseMetrics {
  connections: {
    active: number
    idle: number
    total: number
  }
  queryCount: number
  slowQueries: number
  averageQueryTime: number
}

interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  keys: number
  memoryUsage: number
}

// Global metrics storage
let appMetrics: AppMetrics = {
  timestamp: new Date().toISOString(),
  uptime: 0,
  memory: { used: 0, free: 0, total: 0, percentage: 0 },
  cpu: { usage: 0, loadAverage: [] },
  requests: {
    total: 0,
    active: 0,
    averageResponseTime: 0,
    errorRate: 0,
    statusCodes: {}
  },
  database: {
    connections: { active: 0, idle: 0, total: 0 },
    queryCount: 0,
    slowQueries: 0,
    averageQueryTime: 0
  },
  cache: {
    hits: 0,
    misses: 0,
    hitRate: 0,
    keys: 0,
    memoryUsage: 0
  }
}

// Update metrics periodically
setInterval(() => {
  updateMetrics()
}, 30000) // Update every 30 seconds

function updateMetrics() {
  const memUsage = process.memoryUsage()
  const totalMem = memUsage.heapTotal + memUsage.external
  const usedMem = memUsage.heapUsed + memUsage.external

  appMetrics = {
    ...appMetrics,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(usedMem / 1024 / 1024), // MB
      free: Math.round((totalMem - usedMem) / 1024 / 1024), // MB
      total: Math.round(totalMem / 1024 / 1024), // MB
      percentage: Math.round((usedMem / totalMem) * 100)
    },
    cpu: {
      usage: Math.round(process.cpuUsage().user / 1000000), // CPU seconds
      loadAverage: require('os').loadavg()
    }
  }
}

// Health check endpoint
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const startTime = Date.now()

    // Check database connectivity
    const dbStatus = await checkDatabase()

    // Check Redis connectivity
    const redisStatus = await checkRedis()

    // Get system metrics
    const memoryStatus = getMemoryStatus()
    const diskStatus = getDiskStatus()

    const responseTime = Date.now() - startTime

    const healthStatus: HealthStatus = {
      status: dbStatus.status === 'up' && redisStatus.status === 'up' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        database: dbStatus,
        redis: redisStatus,
        memory: memoryStatus,
        disk: diskStatus
      },
      version: process.env.npm_package_version || '1.0.0'
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503

    logger.info(`Health check completed in ${responseTime}ms - Status: ${healthStatus.status}`)

    res.status(statusCode).json(healthStatus)
  } catch (error) {
    logger.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Metrics endpoint for monitoring systems
export const metrics = async (req: Request, res: Response) => {
  try {
    // Prometheus-compatible metrics format
    const metricsOutput = generatePrometheusMetrics()

    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
    res.send(metricsOutput)
  } catch (error) {
    logger.error('Metrics endpoint failed:', error)
    res.status(500).json({ error: 'Failed to generate metrics' })
  }
}

// Detailed status endpoint
export const status = async (req: Request, res: Response) => {
  try {
    const detailedStatus = await getDetailedStatus()

    res.json({
      ...appMetrics,
      ...detailedStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Status endpoint failed:', error)
    res.status(500).json({ error: 'Failed to get status' })
  }
}

// Readiness check for Kubernetes/load balancers
export const readiness = async (req: Request, res: Response) => {
  try {
    const dbStatus = await checkDatabase()
    const redisStatus = await checkRedis()

    if (dbStatus.status === 'up' && redisStatus.status === 'up') {
      res.status(200).json({ status: 'ready' })
    } else {
      res.status(503).json({
        status: 'not ready',
        services: { database: dbStatus, redis: redisStatus }
      })
    }
  } catch (error) {
    logger.error('Readiness check failed:', error)
    res.status(503).json({ status: 'not ready', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}

// Service check functions
async function checkDatabase(): Promise<ServiceStatus> {
  const startTime = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime

    return {
      status: 'up',
      responseTime
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    logger.error('Database health check failed:', error)

    return {
      status: 'down',
      responseTime,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const startTime = Date.now()

  try {
    const redis = createClient({ url: process.env.REDIS_URL })
    await redis.connect()
    await redis.ping()
    await redis.disconnect()

    const responseTime = Date.now() - startTime

    return {
      status: 'up',
      responseTime
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    logger.error('Redis health check failed:', error)

    return {
      status: 'down',
      responseTime,
      error: error instanceof Error ? error.message : 'Redis connection failed'
    }
  }
}

function getMemoryStatus(): MemoryStatus {
  const memUsage = process.memoryUsage()
  const totalMem = memUsage.heapTotal + memUsage.external
  const usedMem = memUsage.heapUsed + memUsage.external

  return {
    used: Math.round(usedMem / 1024 / 1024), // MB
    free: Math.round((totalMem - usedMem) / 1024 / 1024), // MB
    total: Math.round(totalMem / 1024 / 1024), // MB
    percentage: Math.round((usedMem / totalMem) * 100)
  }
}

function getDiskStatus(): DiskStatus {
  try {
    // Simple disk check using fs.statSync on root directory
    const fs = require('fs')
    const stats = fs.statSync('/')
    const totalSpace = stats.blocks * stats.blksize
    const freeSpace = stats.blocks * stats.blksize - stats.blocks * stats.blksize * 0.1 // Rough estimate

    return {
      used: Math.round((totalSpace - freeSpace) / 1024 / 1024 / 1024), // GB
      free: Math.round(freeSpace / 1024 / 1024 / 1024), // GB
      total: Math.round(totalSpace / 1024 / 1024 / 1024), // GB
      percentage: Math.round(((totalSpace - freeSpace) / totalSpace) * 100)
    }
  } catch (error) {
    logger.warn('Could not get disk status:', error)
    return {
      used: 0,
      free: 0,
      total: 0,
      percentage: 0
    }
  }
}

async function getDetailedStatus() {
  try {
    // Get database connection info
    const dbInfo = await prisma.$queryRaw`
      SELECT
        count(*) as active_connections
      FROM pg_stat_activity
      WHERE state = 'active'
    `

    return {
      database: {
        activeConnections: dbInfo[0]?.active_connections || 0
      }
    }
  } catch (error) {
    logger.warn('Could not get detailed database status:', error)
    return {
      database: {
        activeConnections: 0
      }
    }
  }
}

function generatePrometheusMetrics(): string {
  const metrics = []

  // Application info
  metrics.push(`# HELP ycc_pos_info Application information`)
  metrics.push(`# TYPE ycc_pos_info gauge`)
  metrics.push(`ycc_pos_info{version="${process.env.npm_package_version || '1.0.0'}"} 1`)

  // Uptime
  metrics.push(`# HELP ycc_pos_uptime_seconds Application uptime in seconds`)
  metrics.push(`# TYPE ycc_pos_uptime_seconds counter`)
  metrics.push(`ycc_pos_uptime_seconds ${appMetrics.uptime}`)

  // Memory metrics
  metrics.push(`# HELP ycc_pos_memory_used_bytes Memory used by the application`)
  metrics.push(`# TYPE ycc_pos_memory_used_bytes gauge`)
  metrics.push(`ycc_pos_memory_used_bytes ${appMetrics.memory.used * 1024 * 1024}`)

  metrics.push(`# HELP ycc_pos_memory_total_bytes Total memory available`)
  metrics.push(`# TYPE ycc_pos_memory_total_bytes gauge`)
  metrics.push(`ycc_pos_memory_total_bytes ${appMetrics.memory.total * 1024 * 1024}`)

  // CPU metrics
  metrics.push(`# HELP ycc_pos_cpu_usage_seconds CPU usage in seconds`)
  metrics.push(`# TYPE ycc_pos_cpu_usage_seconds counter`)
  metrics.push(`ycc_pos_cpu_usage_seconds ${appMetrics.cpu.usage}`)

  // Request metrics
  metrics.push(`# HELP ycc_pos_requests_total Total number of requests`)
  metrics.push(`# TYPE ycc_pos_requests_total counter`)
  metrics.push(`ycc_pos_requests_total ${appMetrics.requests.total}`)

  return metrics.join('\n') + '\n'
}

// Middleware to track requests
export const requestTracker = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  appMetrics.requests.active++

  res.on('finish', () => {
    const duration = Date.now() - startTime
    appMetrics.requests.total++
    appMetrics.requests.active--
    appMetrics.requests.averageResponseTime =
      (appMetrics.requests.averageResponseTime + duration) / 2

    // Track status codes
    const statusCode = res.statusCode.toString()
    appMetrics.requests.statusCodes[statusCode] =
      (appMetrics.requests.statusCodes[statusCode] || 0) + 1

    // Calculate error rate
    const errorCodes = Object.keys(appMetrics.requests.statusCodes)
      .filter(code => code.startsWith('4') || code.startsWith('5'))
      .reduce((sum, code) => sum + appMetrics.requests.statusCodes[code], 0)

    appMetrics.requests.errorRate = (errorCodes / appMetrics.requests.total) * 100
  })

  next()
}
