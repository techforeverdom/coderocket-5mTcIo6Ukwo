import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface SocialMedia {
  website: string
  facebook: string
  instagram: string
  twitter: string
  youtube: string
  tiktok: string
}

interface CampaignRequest {
  id: string
  teamName: string
  school: string
  sport: string
  coachName: string
  coachEmail: string
  coachPhone: string
  campaignTitle: string
  goalAmount: number
  startDate: string
  deadline: string
  description: string
  story: string
  expenses?: string
  achievements?: string
  socialMedia: SocialMedia
  additionalInfo?: string
  submittedBy: string
  submitterName: string
  submitterEmail: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewNotes?: string
}

interface CampaignRequestContextType {
  requests: CampaignRequest[]
  submitRequest: (requestData: Omit<CampaignRequest, 'id' | 'status' | 'submittedAt'>) => Promise<string>
  updateRequestStatus: (requestId: string, status: 'approved' | 'rejected', notes?: string) => void
  getRequestById: (requestId: string) => CampaignRequest | undefined
}

const CampaignRequestContext = createContext<CampaignRequestContextType | undefined>(undefined)

const STORAGE_KEY = 'believefundraising_requests'

export function CampaignRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<CampaignRequest[]>([])

  // Load requests from localStorage on mount
  useEffect(() => {
    const savedRequests = localStorage.getItem(STORAGE_KEY)
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests))
      } catch (error) {
        console.error('Error parsing saved requests:', error)
        setRequests([])
      }
    }
  }, [])

  // Save requests to localStorage whenever requests change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
  }, [requests])

  const submitRequest = async (requestData: Omit<CampaignRequest, 'id' | 'status' | 'submittedAt'>): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newRequest: CampaignRequest = {
      ...requestData,
      id: `request-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    }

    setRequests(prev => [newRequest, ...prev])
    return newRequest.id
  }

  const updateRequestStatus = (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    setRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status, 
            reviewedAt: new Date().toISOString().split('T')[0],
            reviewNotes: notes 
          }
        : request
    ))
  }

  const getRequestById = (requestId: string) => {
    return requests.find(request => request.id === requestId)
  }

  return (
    <CampaignRequestContext.Provider value={{
      requests,
      submitRequest,
      updateRequestStatus,
      getRequestById
    }}>
      {children}
    </CampaignRequestContext.Provider>
  )
}

export function useCampaignRequests() {
  const context = useContext(CampaignRequestContext)
  if (context === undefined) {
    throw new Error('useCampaignRequests must be used within a CampaignRequestProvider')
  }
  return context
}