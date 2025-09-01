import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { validateBody, validateParams, validateQuery, commonSchemas } from '../middleware/validation.middleware'
import { asyncHandler } from '../middleware/error.middleware'

const router = Router()

// Get all campaigns
router.get('/',
  validateQuery(z.object({
    page: z.string().transform(val => parseInt(val) || 1).optional(),
    limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)).optional(),
    status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
    category: z.string().optional(),
    search: z.string().optional()
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, status, category, search } = req.query

    // Mock campaign data
    const campaigns = [
      {
        id: 'campaign-1',
        title: 'Lincoln High Basketball Team',
        description: 'Help our basketball team get new uniforms and equipment for the upcoming season.',
        goalAmount: 500000, // $5,000.00
        currentAmount: 275000, // $2,750.00
        status: 'active',
        category: 'sports',
        createdBy: 'coach-1',
        createdAt: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        donorCount: 15,
        image: 'https://picsum.photos/id/403/400/300'
      },
      {
        id: 'campaign-2',
        title: 'Science Club Equipment',
        description: 'Support our science club in purchasing new laboratory equipment for experiments.',
        goalAmount: 300000, // $3,000.00
        currentAmount: 125000, // $1,250.00
        status: 'active',
        category: 'education',
        createdBy: 'teacher-1',
        createdAt: new Date().toISOString(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        donorCount: 8,
        image: 'https://picsum.photos/id/60/400/300'
      }
    ]

    // Apply filters
    let filteredCampaigns = campaigns
    
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status)
    }
    
    if (category) {
      filteredCampaigns = filteredCampaigns.filter(c => c.category === category)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      )
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + limit)

    res.json({
      success: true,
      data: paginatedCampaigns,
      pagination: {
        page,
        limit,
        total: filteredCampaigns.length,
        pages: Math.ceil(filteredCampaigns.length / limit)
      }
    })
  })
)

// Get single campaign
router.get('/:id',
  validateParams(commonSchemas.idParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    // Mock campaign data
    const campaign = {
      id,
      title: 'Lincoln High Basketball Team',
      description: 'Help our basketball team get new uniforms and equipment for the upcoming season. We need your support to make this season successful!',
      goalAmount: 500000,
      currentAmount: 275000,
      status: 'active',
      category: 'sports',
      createdBy: 'coach-1',
      createdAt: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      donorCount: 15,
      image: 'https://picsum.photos/id/403/400/300',
      updates: [
        {
          id: 'update-1',
          title: 'Thank you for your support!',
          content: 'We have reached 55% of our goal thanks to your generous donations.',
          createdAt: new Date().toISOString()
        }
      ],
      recentDonations: [
        {
          id: 'donation-1',
          amount: 5000,
          donorName: 'John Smith',
          message: 'Great cause! Go team!',
          createdAt: new Date().toISOString()
        }
      ]
    }

    res.json({
      success: true,
      data: campaign
    })
  })
)

// Create new campaign
router.post('/',
  authenticateToken,
  requireRole(['coach', 'admin']),
  validateBody(commonSchemas.createCampaignSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description, goalAmount, endDate, category, teamId } = req.body
    const user = req.user

    if (!user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    // Mock campaign creation
    const campaign = {
      id: `campaign-${Date.now()}`,
      title,
      description,
      goalAmount,
      currentAmount: 0,
      status: 'active',
      category,
      teamId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      endDate,
      donorCount: 0,
      image: 'https://picsum.photos/id/403/400/300'
    }

    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    })
  })
)

// Update campaign
router.put('/:id',
  authenticateToken,
  validateParams(commonSchemas.idParamSchema),
  validateBody(commonSchemas.updateCampaignSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const updates = req.body
    const user = req.user

    if (!user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    // Mock campaign update
    const campaign = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    }

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    })
  })
)

// Delete campaign (admin only)
router.delete('/:id',
  authenticateToken,
  requireRole('admin'),
  validateParams(commonSchemas.idParamSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
      campaignId: id
    })
  })
)

export default router