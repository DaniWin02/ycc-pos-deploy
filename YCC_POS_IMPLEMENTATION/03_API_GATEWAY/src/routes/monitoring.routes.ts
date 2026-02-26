import { Router } from 'express'
import {
  healthCheck,
  metrics,
  status,
  readiness,
  requestTracker
} from '../services/monitoring.service'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

// Public health endpoints (no authentication required)
router.get('/health', healthCheck)
router.get('/ready', readiness)

// Protected monitoring endpoints
router.use(authenticateToken)
router.get('/metrics', metrics)
router.get('/status', status)

// Middleware to track all requests
router.use(requestTracker)

export default router
