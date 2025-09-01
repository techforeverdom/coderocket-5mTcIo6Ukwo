import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Share2, Heart, Flag, Trophy } from 'lucide-react'
import { useCampaigns } from '../contexts/CampaignContext'
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'

export function TeamCampaignHero() {
  const { getCurrentCampaign } = useCampaigns()
  const { sendTeamJoinNotification } = useNotifications()
  const { user } = useAuth()
  
  const campaign = getCurrentCampaign()
  const percentage = (campaign.raised / campaign.goal) * 100

  const handleFollowTeam = async () => {
    if (user && user.email && user.phone) {
      await sendTeamJoinNotification(user.email, user.phone, campaign.team)
      alert(`You are now following ${campaign.team}! You'll receive updates via email and SMS.`)
    } else {
      alert('Please ensure your email and phone number are set in your profile to receive updates.')
    }
  }

  const daysRemaining = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
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
              <span className="text-sm font-medium bg-yellow-400 text-black px-2 py-1 rounded">Championship Bound</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
            <p className="text-lg opacity-90">{campaign.description}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleFollowTeam}>
              <Heart className="w-4 h-4 mr-2" />
              Follow Team
            </Button>
          </div>
          <Button variant="ghost" size="sm">
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
  )
}