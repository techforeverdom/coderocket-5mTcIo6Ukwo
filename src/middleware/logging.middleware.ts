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
  
  // Store original end method
  const originalEnd = res.end.bind(res)
  
  // Override end method to capture response details
  res.end = function(this: Response, ...args: any[]): Response {
    const responseTime = Date.now() - startTime
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userId: (req as any).user?.id
    }

    // Log based on environment and log level
    if (config.app.environment === 'development' || config.logging.level === 'debug') {
      const statusColor = res.statusCode >= 400 ? '\x1b[31m' : res.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m'
      const resetColor = '\x1b[0m'
      console.log(
        `${logEntry.timestamp} - ${logEntry.method} ${logEntry.url} - ${statusColor}${logEntry.statusCode}${resetColor} - ${logEntry.responseTime}ms`
      )
    }

    // In production, you might want to send logs to a service
    if (config.app.environment === 'production') {
      // Send to logging service (e.g., Winston, CloudWatch, etc.)
      // Example: logger.info(logEntry)
    }

    // Call original end method with all arguments
    return originalEnd.apply(this, args)
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

  // Add security context to request for later use
  ;(req as any).securityContext = {
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  }

  next()
}

export function logSecurityEvent(eventType: string, details: any, req: Request): void {
  const securityLog = {
    type: eventType,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    userId: (req as any).user?.id,
    details
  }

  console.warn('Security Event:', securityLog)

  // In production, send to security monitoring service
  if (config.app.environment === 'production') {
    // Example: securityLogger.warn(securityLog)
  }
}