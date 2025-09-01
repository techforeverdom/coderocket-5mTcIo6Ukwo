import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        })
        return
      }
      
      res.status(400).json({
        error: 'Invalid request data'
      })
      return
    }
  }
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Query validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        })
        return
      }
      
      res.status(400).json({
        error: 'Invalid query parameters'
      })
      return
    }
  }
}

export function validateParams(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Parameter validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        })
        return
      }
      
      res.status(400).json({
        error: 'Invalid parameters'
      })
      return
    }
  }
}

// Alias for backward compatibility and common usage
export const validateRequest = validateBody

// Combined validation middleware
export function validate(options: {
  body?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (options.params) {
        req.params = options.params.parse(req.params)
      }
      
      if (options.query) {
        req.query = options.query.parse(req.query)
      }
      
      if (options.body) {
        req.body = options.body.parse(req.body)
      }
      
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            location: err.path[0] === 'body' ? 'body' : 
                     err.path[0] === 'query' ? 'query' : 
                     err.path[0] === 'params' ? 'params' : 'unknown'
          }))
        })
        return
      }
      
      res.status(400).json({
        error: 'Invalid request data'
      })
      return
    }
  }
}

// Common validation schemas
export const commonSchemas = {
  // User schemas
  loginSchema: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  }),

  registerSchema: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['student', 'coach', 'parent', 'supporter']),
    team: z.string().optional(),
    position: z.string().optional(),
    phone: z.string().optional()
  }),

  // Campaign schemas
  createCampaignSchema: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    goalAmount: z.number().positive('Goal amount must be positive'),
    endDate: z.string().datetime('Invalid end date format'),
    category: z.string().min(1, 'Category is required'),
    teamId: z.string().optional()
  }),

  updateCampaignSchema: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(20).optional(),
    goalAmount: z.number().positive().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional()
  }),

  // Donation schemas
  createDonationSchema: z.object({
    amount: z.number().positive('Donation amount must be positive'),
    campaignId: z.string().min(1, 'Campaign ID is required'),
    anonymous: z.boolean().default(false),
    message: z.string().max(500, 'Message must be less than 500 characters').optional()
  }),

  // ID parameter schema
  idParamSchema: z.object({
    id: z.string().min(1, 'ID is required')
  }),

  // Pagination schema
  paginationSchema: z.object({
    page: z.string().transform(val => parseInt(val) || 1).default('1'),
    limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)).default('10'),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc')
  })
}