import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth.middleware'
import { validateBody, commonSchemas } from '../middleware/validation.middleware'
import { asyncHandler } from '../middleware/error.middleware'
import { logSecurityEvent } from '../middleware/logging.middleware'

const router = Router()

// Register new user
router.post('/register',
  validateBody(commonSchemas.registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role, team, position, phone } = req.body

    // Mock user creation (in real app, hash password and save to database)
    const user = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      team,
      position,
      phone,
      verified: false,
      createdAt: new Date().toISOString()
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    // Log security event
    logSecurityEvent('account-creation', { userId: user.id, email: user.email }, req)

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified: user.verified
        },
        token
      },
      message: 'Account created successfully'
    })
  })
)

// Login user
router.post('/login',
  validateBody(commonSchemas.loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body

    // Mock user authentication (in real app, verify password hash)
    const mockUsers = [
      {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@believefundraising.com',
        role: 'admin',
        verified: true
      },
      {
        id: 'coach-1',
        name: 'Coach Johnson',
        email: 'coach.johnson@lincolnhigh.edu',
        role: 'coach',
        team: 'Lincoln High Basketball',
        verified: true
      },
      {
        id: 'student-1',
        name: 'Alex Thompson',
        email: 'alex.thompson@student.lincolnhigh.edu',
        role: 'student',
        team: 'Lincoln High Basketball',
        verified: true
      }
    ]

    const user = mockUsers.find(u => u.email === email)
    
    if (!user || password !== 'password123') {
      logSecurityEvent('login-failed', { email, reason: 'invalid-credentials' }, req)
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
      return
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    // Log successful login
    logSecurityEvent('login-success', { userId: user.id, email: user.email }, req)

    res.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Login successful'
    })
  })
)

// Get current user profile
router.get('/profile',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user

    if (!user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    // Mock user profile data
    const profile = {
      id: user.id,
      name: user.email.split('@')[0], // Mock name from email
      email: user.email,
      role: user.role,
      verified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    res.json({
      success: true,
      data: profile
    })
  })
)

// Update user profile
router.put('/profile',
  authenticateToken,
  validateBody(z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    team: z.string().optional(),
    position: z.string().optional()
  })),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user
    const updates = req.body

    if (!user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    // Mock profile update
    const updatedProfile = {
      id: user.id,
      email: user.email,
      role: user.role,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    })
  })
)

// Change password
router.post('/change-password',
  authenticateToken,
  validateBody(z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6)
  })),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user
    const { currentPassword, newPassword } = req.body

    if (!user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    // Mock password change (in real app, verify current password and hash new one)
    if (currentPassword !== 'password123') {
      logSecurityEvent('password-change-failed', { userId: user.id, reason: 'invalid-current-password' }, req)
      res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      })
      return
    }

    // Log successful password change
    logSecurityEvent('password-change-success', { userId: user.id }, req)

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  })
)

// Logout (client-side token removal, but log the event)
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user

    if (user) {
      logSecurityEvent('logout', { userId: user.id }, req)
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  })
)

export default router