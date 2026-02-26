import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { Request, Response, NextFunction } from 'express'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'info'
}

// Define colors for log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Add colors to winston
winston.addColors(colors)

// Define the format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

// Define which transports the logger must use
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),

  // Error log file
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
  }),

  // Combined log file
  new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
  }),

  // HTTP requests log file
  new DailyRotateFile({
    filename: 'logs/http-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '14d',
  }),
]

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }))
}

// HTTP request logging middleware
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`

    if (res.statusCode >= 400) {
      logger.error(message)
    } else if (res.statusCode >= 300) {
      logger.warn(message)
    } else {
      logger.http(message)
    }
  })

  next()
}

// Request context logger
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.http(`Request: ${req.method} ${req.originalUrl} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`)
  next()
}

// Error logger
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${error.message} - Stack: ${error.stack} - URL: ${req.originalUrl} - Method: ${req.method}`)
  next(error)
}

// Performance logger
export const performanceLogger = (operation: string, duration: number, metadata?: any) => {
  const message = `Performance: ${operation} took ${duration}ms`
  if (metadata) {
    logger.info(`${message} - Metadata: ${JSON.stringify(metadata)}`)
  } else {
    logger.info(message)
  }
}

// Business metrics logger
export const businessLogger = (event: string, data: any) => {
  logger.info(`Business: ${event} - ${JSON.stringify(data)}`)
}

// Database logger
export const databaseLogger = (query: string, duration: number, error?: Error) => {
  if (error) {
    logger.error(`Database Error: ${query} - Duration: ${duration}ms - Error: ${error.message}`)
  } else {
    logger.debug(`Database Query: ${query} - Duration: ${duration}ms`)
  }
}

export default logger
