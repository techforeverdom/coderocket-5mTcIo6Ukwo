import { Request, Response, NextFunction } from 'express'
import { config } from '../config/config'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function createError(message: string, statusCode: number = 500): AppError {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  return error
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal Server Error'

  // Log error details
  console.error('Error occurred:', {
    message: error.message,
    statusCode,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      ...(config.app.environment !== 'production' && {
        stack: error.stack,
        details: {
          url: req.url,
          method: req.method,
          timestamp: new Date().toISOString()
        }
      })
    }
  })
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = createError(`Route ${req.originalUrl} not found`, 404)
  next(error)
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}