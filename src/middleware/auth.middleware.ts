import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/config'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export interface JWTPayload {
  id: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' })
    return
  }

  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as JWTPayload
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    }
    next()
  } catch (error) {
    console.error('Token verification failed:', error)
    res.status(403).json({ error: 'Invalid or expired token' })
    return
  }
}

export function requireRole(roles: string | string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      })
      return
    }

    next()
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireRole('admin')(req, res, next)
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    next()
    return
  }

  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as JWTPayload
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    // Token is invalid, but we continue without user info
    console.warn('Optional auth token verification failed:', error)
  }

  next()
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.auth.jwtSecret) as JWTPayload
  } catch (error) {
    return null
  }
}