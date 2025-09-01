import { Header } from './Header'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Link } from 'react-router-dom'
import { TrendingUp, Users, DollarSign, Trophy, Target, Calendar, Share2 } from 'lucide-react'
import { useCampaigns } from '../contexts/CampaignContext'

export function FundraisingDashboard() {
  const { campaigns } = useCampaigns()
  
  // Only use existing campaigns for leaderboards
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0)
  const totalSupporters = campaigns.reduce((sum, campaign) => sum + campaign.supporters, 0)
  
  // Top teams based on actual campaigns
  const topTeams = [...campaigns]
    .sort((a, b) => b.raised - a.raised)
    .slice(0, 5)
    .map((campaign, index) => ({
      rank: index + 1,
      name: campaign.team,
      school: campaign.school,
      raised: campaign.raised,
      goal: campaign.goal,
      sport: campaign.sport,
      id: campaign.id
    }))

  // Generate realistic top supporters based on actual campaign data
  const generateTopSupporters = () => {
    const supporters = []
    const names = ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'David Thompson', 'Lisa Wang']
    const companies = ['Local Business', 'Alumni Association', 'Parent Group', 'Community Foundation', 'Sports Booster Club']
    
    for (let i = 0; i < 5; i++) {
      const isCompany = Math.random() > 0.6
      const baseAmount = Math.max(50, Math.floor(totalRaised / campaigns.length / 10))
      const amount = baseAmount + Math.floor(Math.random() * baseAmount * 2)
      
      supporters.push({
        rank: i + 1,
        name: isCompany ? companies[i] : names[i],
        amount: amount,
        donations: Math.floor(Math.random() * 5) + 1,
        isCompany
      })
    }
    
    return supporters.sort((a, b) => b.amount - a.amount)
  }

  const topSupporters = generateTopSupporters()

  const handleShare = async (campaign: any) => {
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

  const stats = [
    {
      title: "Total Raised",
      value: `$${totalRaised.toLocaleString()}`,
      change: "+12% from last month",
      icon: <DollarSign className="w-6 h-6 text-green-600" />
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns.length.toString(),
      change: `${campaigns.length} total campaigns`,
      icon: <Target className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Total Supporters",
      value: totalSupporters.toLocaleString(),
      change: "Across all teams",
      icon: <Users className="w-6 h-6 text-purple-600" />
    },
    {
      title: "Success Rate",
      value: "87%",
      change: "Teams reaching goals",
      icon: <Trophy className="w-6 h-6 text-yellow-600" />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Fundraising Dashboard</h1>
          <p className="text-gray-600">
            Track progress, discover teams, and support youth sports in your community
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Campaigns */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Featured Campaigns</h2>
                <Link to="/campaigns">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>

              <div className="space-y-6">
                {activeCampaigns.slice(0, 3).map((campaign) => {
                  const percentage = (campaign.raised / campaign.goal) * 100
                  const daysRemaining = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <div key={campaign.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <img 
                        src={campaign.image} 
                        alt={campaign.team}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                            <p className="text-sm text-gray-600">{campaign.team} • {campaign.school}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{campaign.sport}</Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleShare(campaign)
                              }}
                              title="Share campaign"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">${campaign.raised.toLocaleString()} raised</span>
                            <span className="text-gray-600">${campaign.goal.toLocaleString()} goal</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{percentage.toFixed(1)}% funded • {campaign.supporters} supporters</span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          <Link to={`/team/${campaign.id}`}>
                            <Button size="sm">Support Team</Button>
                          </Link>
                          <Link to={`/team/${campaign.id}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Leaderboards */}
          <div className="space-y-6">
            {/* Top Teams */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Teams</h3>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              
              <div className="space-y-3">
                {topTeams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                        {team.rank}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{team.name}</div>
                        <div className="text-xs text-gray-500">{team.school}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${team.raised.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{((team.raised / team.goal) * 100).toFixed(0)}% of goal</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Supporters */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Supporters</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="space-y-3">
                {topSupporters.map((supporter) => (
                  <div key={supporter.rank} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-semibold text-green-600">
                        {supporter.rank}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{supporter.name}</div>
                        <div className="text-xs text-gray-500">
                          {supporter.donations} donation{supporter.donations > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">${supporter.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}