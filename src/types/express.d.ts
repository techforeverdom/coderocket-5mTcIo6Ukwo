import { Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

// Extend Express Request interface for better type safety
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
      }
    }
  }
}

// Custom request types for different route handlers
export interface TypedRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {}

// Authentication request type
export interface AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>
> extends TypedRequest<P, ResBody, ReqBody, ReqQuery, Locals> {
  user: {
    id: string
    email: string
    role: string
  }
}