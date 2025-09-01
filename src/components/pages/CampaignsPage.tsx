import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Progress } from '../ui/progress'
import { Search, Filter, MapPin, Calendar, Users, Share2 } from 'lucide-react'
import { useCampaigns } from '../../contexts/CampaignContext'

export function CampaignsPage() {
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [sportFilter, setSportFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { campaigns } = useCampaigns()

  // Update search term when URL search param changes
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchTerm(urlSearch)
    }
  }, [searchParams])

  const handleShare = async (campaign: any, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const url = `${window.location.origin}/team/${campaign.id}`
    const text = `Support ${campaign.team} - ${campaign.description}`
    
    try {
      if (navigator.share && navigator.canShare) {
        await navigator.share({
          title: campaign.title,
          text: text,
          url: url
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url)
        
        // Show success message
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50'
        notification.textContent = 'Campaign link copied to clipboard!'
        document.body.appendChild(notification)
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
      }
    } catch (error) {
      // Final fallback - show the URL in an alert
      alert(`Share this campaign: ${url}`)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.school.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSport = sportFilter === 'all' || campaign.sport.toLowerCase() === sportFilter.toLowerCase()
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesSport && matchesStatus
  })

  const uniqueSports = [...new Set(campaigns.map(c => c.sport))]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Campaigns</h1>
          <p className="text-gray-600">
            Discover and support sports teams working towards their goals
          </p>
          {searchTerm && (
            <p className="text-blue-600 mt-2">
              Showing results for: "{searchTerm}"
            </p>
          )}
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns, teams, or schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {uniqueSports.map(sport => (
                    <SelectItem key={sport} value={sport.toLowerCase()}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const percentage = (campaign.raised / campaign.goal) * 100
            const daysRemaining = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            
            return (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-r from-blue-600 to-green-600 relative">
                  <img 
                    src={campaign.image}
                    alt={campaign.team}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white text-gray-900">{campaign.sport}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                      onClick={(e) => handleShare(campaign, e)}
                      title="Share this campaign"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                    <p className="text-gray-600 text-sm">{campaign.description}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{campaign.team}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{campaign.school}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {daysRemaining > 0 ? `${daysRemaining} days left` : 'Campaign ended'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">${campaign.raised.toLocaleString()} raised</span>
                      <span className="text-gray-600">${campaign.goal.toLocaleString()} goal</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{percentage.toFixed(1)}% funded</span>
                      <span>{campaign.supporters} supporters</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link to={`/team/${campaign.id}`}>
                      <Button className="w-full">
                        Support Team
                      </Button>
                    </Link>
                    <div className="flex space-x-2">
                      <Link to={`/team/${campaign.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => handleShare(campaign, e)}
                        title="Share campaign"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No campaigns match "${searchTerm}". Try adjusting your search or filter criteria.`
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  )
}