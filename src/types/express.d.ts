import { Request } from 'express'

// Extend Express Request interface globally
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

// Export empty object to make this a module
export {}