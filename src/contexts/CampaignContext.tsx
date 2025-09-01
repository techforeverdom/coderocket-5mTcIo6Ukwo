import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface SocialMedia {
  website?: string
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
  tiktok?: string
}

interface Campaign {
  id: string
  title: string
  team: string
  school: string
  sport: string
  raised: number
  goal: number
  supporters: number
  status: 'active' | 'pending' | 'paused' | 'completed'
  image: string
  description: string
  story: string
  created: string
  deadline: string
  coachName?: string
  coachEmail?: string
  socialMedia?: SocialMedia
}

interface CampaignContextType {
  campaigns: Campaign[]
  updateCampaignFunding: (campaignId: string, amount: number) => void
  getCurrentCampaign: () => Campaign
  addCampaign: (campaign: Omit<Campaign, 'id' | 'raised' | 'supporters' | 'created'>) => void
  deleteCampaign: (campaignId: string) => void
  updateCampaignStatus: (campaignId: string, status: Campaign['status']) => void
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => void
  getCampaignById: (campaignId: string) => Campaign | undefined
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

const STORAGE_KEY = 'believefundraising_campaigns'

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Load campaigns from localStorage on mount
  useEffect(() => {
    const savedCampaigns = localStorage.getItem(STORAGE_KEY)
    if (savedCampaigns) {
      try {
        setCampaigns(JSON.parse(savedCampaigns))
      } catch (error) {
        console.error('Error parsing saved campaigns:', error)
        initializeDefaultCampaigns()
      }
    } else {
      initializeDefaultCampaigns()
    }
  }, [])

  const initializeDefaultCampaigns = () => {
    const defaultCampaigns: Campaign[] = [
      {
        id: 'eagles-basketball-2024',
        title: 'Help Eagles Basketball Reach State Championships',
        team: 'Eagles Basketball Team',
        school: 'Lincoln High School',
        sport: 'Basketball',
        raised: 18750,
        goal: 35000,
        supporters: 247,
        status: 'active',
        image: 'https://picsum.photos/id/431/800/400',
        description: 'Supporting our team\'s journey to compete at the highest level',
        story: 'The Lincoln High Eagles basketball team has been working tirelessly to reach the state championships. We need your support to cover travel expenses, equipment upgrades, and tournament fees.',
        created: '2024-01-15',
        deadline: '2024-03-15',
        coachName: 'Coach Johnson',
        coachEmail: 'coach.johnson@lincolnhigh.edu',
        socialMedia: {
          website: 'https://lincolnhigh.edu/athletics/basketball',
          instagram: 'https://instagram.com/lincolneagles',
          facebook: 'https://facebook.com/lincolneaglesbasketball',
          twitter: 'https://twitter.com/lincolneagles'
        }
      },
      {
        id: 'warriors-football-2024',
        title: 'Warriors Football Championship Fund',
        team: 'Warriors Football',
        school: 'Central High School',
        sport: 'Football',
        raised: 52750,
        goal: 60000,
        supporters: 428,
        status: 'active',
        image: 'https://picsum.photos/id/342/800/400',
        description: 'Equipment and travel fund for championship season',
        story: 'Our Warriors football team is having an incredible season and needs support for the championship playoffs.',
        created: '2024-01-10',
        deadline: '2024-02-28',
        coachName: 'Coach Martinez',
        coachEmail: 'coach.martinez@centralhigh.edu',
        socialMedia: {
          website: 'https://centralhigh.edu/athletics/football',
          instagram: 'https://instagram.com/centralwarriors',
          youtube: 'https://youtube.com/@centralwarriors'
        }
      }
    ]
    setCampaigns(defaultCampaigns)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCampaigns))
  }

  // Save campaigns to localStorage whenever campaigns change
  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns))
    }
  }, [campaigns])

  const updateCampaignFunding = (campaignId: string, amount: number) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            raised: campaign.raised + amount,
            supporters: campaign.supporters + 1
          }
        : campaign
    ))
  }

  const getCurrentCampaign = () => {
    return campaigns.find(c => c.id === 'eagles-basketball-2024') || campaigns[0]
  }

  const addCampaign = (campaignData: Omit<Campaign, 'id' | 'raised' | 'supporters' | 'created'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: `campaign-${Date.now()}`,
      raised: 0,
      supporters: 0,
      created: new Date().toISOString().split('T')[0]
    }
    setCampaigns(prev => [...prev, newCampaign])
  }

  const deleteCampaign = (campaignId: string) => {
    setCampaigns(prev => {
      const filtered = prev.filter(campaign => campaign.id !== campaignId)
      // Force update localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return filtered
    })
  }

  const updateCampaignStatus = (campaignId: string, status: Campaign['status']) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status }
        : campaign
    ))
  }

  const updateCampaign = (campaignId: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, ...updates }
        : campaign
    ))
  }

  const getCampaignById = (campaignId: string) => {
    return campaigns.find(campaign => campaign.id === campaignId)
  }

  return (
    <CampaignContext.Provider value={{
      campaigns,
      updateCampaignFunding,
      getCurrentCampaign,
      addCampaign,
      deleteCampaign,
      updateCampaignStatus,
      updateCampaign,
      getCampaignById
    }}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaigns() {
  const context = useContext(CampaignContext)
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider')
  }
  return context
}