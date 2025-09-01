import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Share2, Heart, Flag, Trophy, MapPin, Calendar, Users, Globe, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { useCampaigns } from '../../contexts/CampaignContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { TeamDonationSection } from '../TeamDonationSection'

export function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const { getCampaignById } = useCampaigns()
  const { sendTeamJoinNotification, sendEmailNotification } = useNotifications()
  const { user, getAllUsers } = useAuth()
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportData, setReportData] = useState({
    reason: '',
    description: ''
  })
  
  const campaign = getCampaignById(teamId || '')

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Not Found</h1>
            <p className="text-gray-600">The team you're looking for doesn't exist or has been removed.</p>
          </Card>
        </main>
      </div>
    )
  }

  const percentage = (campaign.raised / campaign.goal) * 100
  const daysRemaining = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const handleFollowTeam = async () => {
    if (user && user.email && user.phone) {
      await sendTeamJoinNotification(user.email, user.phone, campaign.team)
      alert(`You are now following ${campaign.team}! You'll receive updates via email and SMS.`)
    } else {
      alert('Please ensure your email and phone number are set in your profile to receive updates.')
    }
  }

  const handleShare = async (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const url = window.location.href
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
        notification.textContent = 'Team link copied to clipboard!'
        document.body.appendChild(notification)
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
      }
    } catch (error) {
      // Final fallback - show the URL in an alert
      alert(`Share this team: ${url}`)
    }
  }

  const handleReport = async () => {
    if (!reportData.reason || !reportData.description) {
      alert('Please fill in all fields')
      return
    }

    try {
      // Get all admin users
      const allUsers = getAllUsers()
      const adminUsers = allUsers.filter(u => u.role === 'admin')

      // Send email to all admins
      const subject = `Campaign Report: ${campaign.title}`
      const message = `
A user has reported an issue with a campaign:

CAMPAIGN DETAILS:
- Title: ${campaign.title}
- Team: ${campaign.team}
- School: ${campaign.school}
- Campaign ID: ${campaign.id}
- URL: ${window.location.href}

REPORT DETAILS:
- Reported by: ${user?.name || 'Anonymous'} (${user?.email || 'No email'})
- Reason: ${reportData.reason}
- Description: ${reportData.description}
- Date: ${new Date().toLocaleString()}

Please review this campaign and take appropriate action if necessary.

Believe Fundraising Group Admin System
      `

      // Send to all admins
      for (const admin of adminUsers) {
        await sendEmailNotification(admin.email, subject, message)
      }

      alert('Report submitted successfully. Our team will review it shortly.')
      setShowReportModal(false)
      setReportData({ reason: '', description: '' })
    } catch (error) {
      alert('Failed to submit report. Please try again.')
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'website': return <Globe className="w-4 h-4" />
      case 'facebook': return <Facebook className="w-4 h-4" />
      case 'instagram': return <Instagram className="w-4 h-4" />
      case 'twitter': return <Twitter className="w-4 h-4" />
      case 'youtube': return <Youtube className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gradient-to-r from-blue-600 to-green-600 relative">
                <img 
                  src={campaign.image}
                  alt={campaign.team}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                  <div className="p-6 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <Badge className="bg-yellow-400 text-black">{campaign.sport}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
                    <p className="text-lg opacity-90">{campaign.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleFollowTeam}>
                      <Heart className="w-4 h-4 mr-2" />
                      Follow Team
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowReportModal(true)}>
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">${campaign.raised.toLocaleString()}</div>
                      <div className="text-gray-600">raised of ${campaign.goal.toLocaleString()} goal</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-gray-900">{campaign.supporters}</div>
                      <div className="text-gray-600">supporters</div>
                    </div>
                  </div>

                  <Progress value={percentage} className="h-3" />

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{percentage.toFixed(1)}% funded</span>
                    <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Campaign ended'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Profile */}
            <Card className="p-6">
              <div className="flex items-start space-x-6">
                <img 
                  src={campaign.image} 
                  alt={campaign.team}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{campaign.team}</h2>
                      <p className="text-gray-600">{campaign.school}</p>
                    </div>
                    <Badge variant="secondary">Verified Team</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{campaign.sport} Team</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{campaign.school}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Goal: {campaign.deadline}</span>
                    </div>
                  </div>

                  {campaign.coachName && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-semibold text-gray-900">Team Leadership</h3>
                      </div>
                      <p className="text-gray-700">Coach: {campaign.coachName}</p>
                    </div>
                  )}

                  {/* Social Media Links */}
                  {campaign.socialMedia && Object.values(campaign.socialMedia).some(url => url) && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Follow Our Team</h3>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(campaign.socialMedia).map(([platform, url]) => {
                          if (!url) return null
                          return (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              {getSocialIcon(platform)}
                              <span className="text-sm font-medium capitalize">{platform}</span>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">About Our Team</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {campaign.story}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Campaign Updates */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Team Updates</h3>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Campaign Launch - Let's Reach Our Goal!
                    </h4>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{campaign.created}</span>
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    We're excited to launch our fundraising campaign! Your support will help us achieve our goals and compete at the highest level. Every donation, no matter the size, makes a difference in our journey.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <TeamDonationSection campaign={campaign} />
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Campaign</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason for Report</Label>
                  <select
                    id="reason"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={reportData.reason}
                    onChange={(e) => setReportData({...reportData, reason: e.target.value})}
                  >
                    <option value="">Select a reason</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="misleading_information">Misleading Information</option>
                    <option value="spam">Spam</option>
                    <option value="fraud">Suspected Fraud</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide details about the issue..."
                    value={reportData.description}
                    onChange={(e) => setReportData({...reportData, description: e.target.value})}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <Button variant="outline" onClick={() => setShowReportModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleReport} className="flex-1">
                  Submit Report
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}