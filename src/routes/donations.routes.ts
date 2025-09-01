import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { validateBody, validateParams, commonSchemas } from '../middleware/validation.middleware'
import { asyncHandler } from '../middleware/error.middleware'

const router = Router()

// Get all donations (admin only)
router.get('/', 
  authenticateToken,
  requireRole('admin'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Mock donation data
    const donations = [
      {
        id: 'donation-1',
        amount: 5000, // $50.00
        campaignId: 'campaign-1',
        donorId: 'user-2',
        donorName: 'John Smith',
        anonymous: false,
        message: 'Great cause! Go team!',
        createdAt: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: 'donation-2',
        amount: 2500, // $25.00
        campaignId: 'campaign-1',
        donorId: 'user-3',
        donorName: 'Anonymous',
        anonymous: true,
        message: '',
        createdAt: new Date().toISOString(),
        status: 'completed'
      }
    ]

    res.json({
      success: true,
      data: donations,
      total: donations.length
    })
  })
)

// Get donations for a specific campaign
router.get('/campaign/:campaignId',
  validateParams(z.object({
    campaignId: z.string().min(1, 'Campaign ID is required')
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { campaignId } = req.params

    // Mock donation data for campaign
    const donations = [
      {
        id: 'donation-1',
        amount: 5000,
        donorName: 'John Smith',
        anonymous: false,
        message: 'Great cause! Go team!',
        createdAt: new Date().toISOString()
      }
    ]

    res.json({
      success: true,
      data: donations,
      campaignId,
      total: donations.length
    })
  })
)

// Create a new donation
router.post('/',
  authenticateToken,
  validateBody(commonSchemas.createDonationSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { amount, campaignId, anonymous, message } = req.body
    const user = req.user

    if (!user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    // Mock donation creation
    const donation = {
      id: `donation-${Date.now()}`,
      amount,
      campaignId,
      donorId: user.id,
      donorName: anonymous ? 'Anonymous' : user.email, // Using email as name fallback
      anonymous,
      message: message || '',
      createdAt: new Date().toISOString(),
      status: 'pending'
    }

    // In a real app, you would:
    // 1. Create payment intent with Stripe
    // 2. Save donation to database
    // 3. Send confirmation email
    // 4. Update campaign totals

    res.status(201).json({
      success: true,
      data: donation,
      message: 'Donation created successfully'
    })
  })
)

// Get user's donation history
router.get('/my-donations',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user

    if (!user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    // Mock user donations
    const donations = [
      {
        id: 'donation-1',
        amount: 5000,
        campaignId: 'campaign-1',
        campaignTitle: 'Lincoln High Basketball Team',
        anonymous: false,
        message: 'Great cause! Go team!',
        createdAt: new Date().toISOString(),
        status: 'completed'
      }
    ]

    res.json({
      success: true,
      data: donations,
      userId: user.id,
      total: donations.length
    })
  })
)

// Update donation (admin only)
router.put('/:id',
  authenticateToken,
  requireRole('admin'),
  validateParams(commonSchemas.idParamSchema),
  validateBody(z.object({
    status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    message: z.string().max(500).optional()
  })),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const updates = req.body

    // Mock donation update
    const donation = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    res.json({
      success: true,
      data: donation,
      message: 'Donation updated successfully'
    })
  })
)

// Delete/refund donation (admin only)
router.delete('/:id',
  authenticateToken,
  requireRole('admin'),
  validateParams(commonSchemas.idParamSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params

    // In a real app, you would:
    // 1. Process refund through Stripe
    // 2. Update donation status
    // 3. Update campaign totals
    // 4. Send notification emails

    res.json({
      success: true,
      message: 'Donation refunded successfully',
      donationId: id
    })
  })
)

// Get donation statistics (admin only)
router.get('/stats',
  authenticateToken,
  requireRole('admin'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Mock donation statistics
    const stats = {
      totalDonations: 15,
      totalAmount: 125000, // $1,250.00
      averageDonation: 8333, // $83.33
      topDonation: 25000, // $250.00
      recentDonations: [
        {
          id: 'donation-1',
          amount: 5000,
          donorName: 'John Smith',
          campaignTitle: 'Lincoln High Basketball',
          createdAt: new Date().toISOString()
        }
      ],
      donationsByStatus: {
        completed: 12,
        pending: 2,
        failed: 1,
        refunded: 0
      }
    }

    res.json({
      success: true,
      data: stats
    })
  })
)

export default router