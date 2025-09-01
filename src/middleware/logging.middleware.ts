import { Request, Response, NextFunction } from 'express'
import { config } from '../config/config'

export interface LogEntry {
  timestamp: string
  method: string
  url: string
  statusCode?: number
  responseTime?: number
  userAgent?: string
  ip: string
  userId?: string
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now()
  
  // Capture original end function
  const originalEnd = res.end
  
  // Override end function to log response
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userId: (req as any).user?.id
    }

    // Log based on environment and log level
    if (config.app.environment === 'development' || config.logging.level === 'debug') {
      console.log(`${logEntry.method} ${logEntry.url} - ${logEntry.statusCode} - ${logEntry.responseTime}ms`)
    }

    // In production, you might want to send logs to a service
    if (config.app.environment === 'production') {
      // Send to logging service (e.g., Winston, CloudWatch, etc.)
    }

    // Call original end function
    originalEnd.call(this, chunk, encoding)
  }

  next()
}

export function securityLogger(req: Request, res: Response, next: NextFunction): void {
  // Log security-relevant events
  const securityEvents = [
    'login',
    'logout',
    'password-reset',
    'account-creation',
    'permission-denied'
  ]

  // This would typically be called from route handlers for specific events
  // For now, we'll just pass through
  next()
}