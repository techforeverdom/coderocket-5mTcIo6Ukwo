import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.middleware'
import { validateBody, validateParams, validateQuery, commonSchemas } from '../middleware/validation.middleware'
import { asyncHandler } from '../middleware/error.middleware'

const router = Router()

// Query schema for campaigns listing
const campaignsQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).default('1'),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)).default('10'),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional(),
  category: z.string().optional(),
  search: z.string().optional()
})

// Get all campaigns
router.get('/',
  validateQuery(campaignsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as z.infer<typeof campaignsQuerySchema>
    const { page, limit, status, category, search } = query

    // Mock campaign data
    const campaigns = [
      {
        id: 'campaign-1',
        title: 'Lincoln High Basketball Team',
        description: 'Help our basketball team get new uniforms and equipment for the upcoming season.',
        goalAmount: 500000, // $5,000.00
        currentAmount: 275000, // $2,750.00
        status: 'active' as const,
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
        status: 'active' as const,
        category: 'education',
        createdBy: 'teacher-1',
        createdAt: new Date().toISOString(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        donorCount: 8,
        image: 'https://picsum.photos/id/60/400/300'
      },
      {
        id: 'campaign-3',
        title: 'Drama Club Costumes',
        description: 'Help our drama club purchase costumes and props for the upcoming school play.',
        goalAmount: 200000, // $2,000.00
        currentAmount: 85000, // $850.00
        status: 'paused' as const,
        category: 'arts',
        createdBy: 'teacher-2',
        createdAt: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        donorCount: 5,
        image: 'https://picsum.photos/id/180/400/300'
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
    
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase()
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      )
    }

    // Apply pagination with proper number types
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const startIndex = (pageNum - 1) * limitNum
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + limitNum)

    res.json({
      success: true,
      data: paginatedCampaigns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredCampaigns.length,
        pages: Math.ceil(filteredCampaigns.length / limitNum)
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

// Get campaign statistics
router.get('/stats/overview',
  authenticateToken,
  requireRole(['coach', 'admin']),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Mock campaign statistics
    const stats = {
      totalCampaigns: 15,
      activeCampaigns: 8,
      completedCampaigns: 5,
      pausedCampaigns: 2,
      totalRaised: 2500000, // $25,000.00
      averageGoal: 400000, // $4,000.00
      successRate: 0.75, // 75%
      topCategories: [
        { category: 'sports', count: 6, amount: 1200000 },
        { category: 'education', count: 4, amount: 800000 },
        { category: 'arts', count: 3, amount: 350000 },
        { category: 'community', count: 2, amount: 150000 }
      ]
    }

    res.json({
      success: true,
      data: stats
    })
  })
)

// Get campaigns by category
router.get('/category/:category',
  validateParams(z.object({
    category: z.string().min(1, 'Category is required')
  })),
  validateQuery(z.object({
    page: z.string().transform(val => parseInt(val) || 1).default('1'),
    limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)).default('10')
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params
    const query = req.query as { page: number; limit: number }
    const { page, limit } = query

    // Mock campaigns by category
    const campaigns = [
      {
        id: 'campaign-1',
        title: 'Lincoln High Basketball Team',
        description: 'Help our basketball team get new uniforms and equipment.',
        goalAmount: 500000,
        currentAmount: 275000,
        status: 'active',
        category: 'sports',
        donorCount: 15,
        image: 'https://picsum.photos/id/403/400/300'
      }
    ].filter(c => c.category === category)

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const startIndex = (pageNum - 1) * limitNum
    const paginatedCampaigns = campaigns.slice(startIndex, startIndex + limitNum)

    res.json({
      success: true,
      data: paginatedCampaigns,
      category,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: campaigns.length,
        pages: Math.ceil(campaigns.length / limitNum)
      }
    })
  })
)

export default router