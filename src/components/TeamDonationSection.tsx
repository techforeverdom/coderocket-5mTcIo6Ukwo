import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Heart, Share2, Users, Calendar, Target, Trophy } from 'lucide-react'
import { useCampaigns } from '../contexts/CampaignContext'
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'
import { StripePayment } from './payment/StripePayment'

interface TeamDonationSectionProps {
  campaign: {
    id: string
    title: string
    team: string
    school: string
    sport: string
    raised: number
    goal: number
    supporters: number
    status: string
    image: string
    description: string
    story: string
    created: string
    deadline: string
    coachName?: string
    coachEmail?: string
  }
}

export function TeamDonationSection({ campaign }: TeamDonationSectionProps) {
  const [donationAmount, setDonationAmount] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [email, setEmail] = useState('')
  const { updateCampaignFunding } = useCampaigns()
  const { subscribeToUpdates } = useNotifications()
  const { user } = useAuth()
  
  const percentage = (campaign.raised / campaign.goal) * 100
  const daysRemaining = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const presetAmounts = [25, 50, 100, 250]

  const handleDonate = () => {
    const amount = parseFloat(donationAmount)
    if (amount && amount >= 5) {
      setShowPayment(true)
    } else {
      alert('Minimum donation amount is $5')
    }
  }

  const handleSubscribe = async () => {
    if (email && email.includes('@')) {
      try {
        await subscribeToUpdates(email, campaign.team)
        alert(`Successfully subscribed ${email} to ${campaign.team} updates!`)
        setEmail('')
      } catch (error) {
        alert('Failed to subscribe. Please try again.')
      }
    } else {
      alert('Please enter a valid email address')
    }
  }

  const handleShare = () => {
    const url = window.location.href
    const text = `Support ${campaign.team} - ${campaign.description}`
    
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: text,
        url: url
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Team link copied to clipboard!')
      }).catch(() => {
        alert(`Share this team: ${url}`)
      })
    }
  }

  if (showPayment) {
    return (
      <StripePayment
        amount={parseFloat(donationAmount)}
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        onSuccess={() => {
          setShowPayment(false)
          setDonationAmount('')
          updateCampaignFunding(campaign.id, parseFloat(donationAmount))
        }}
        onCancel={() => setShowPayment(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Campaign Stats */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Support {campaign.team}</h3>
            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
              {campaign.status}
            </Badge>
          </div>

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
            <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Campaign ended'}</span>
          </div>
        </div>
      </Card>

      {/* Donation Form */}
      {campaign.status === 'active' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Make a Donation</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {presetAmounts.map(amount => (
                <Button
                  key={amount}
                  variant={donationAmount === amount.toString() ? "default" : "outline"}
                  onClick={() => setDonationAmount(amount.toString())}
                  className="h-12"
                >
                  ${amount}
                </Button>
              ))}
            </div>

            <div>
              <Input
                type="number"
                placeholder="Enter custom amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                min="5"
                className="text-center text-lg"
              />
            </div>

            <Button 
              onClick={handleDonate}
              className="w-full h-12 text-lg"
              disabled={!donationAmount || parseFloat(donationAmount) < 5}
            >
              Donate ${donationAmount || '0'}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              Secure payment powered by Stripe. Your donation helps {campaign.team} reach their goals.
            </div>
          </div>
        </Card>
      )}

      {/* Team Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Details</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">{campaign.team}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">{campaign.sport}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">{campaign.school}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Deadline: {campaign.deadline}</span>
          </div>
          {campaign.coachName && (
            <div className="pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Coach:</span> {campaign.coachName}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Subscribe to Updates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Updated</h3>
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleSubscribe} variant="outline" className="w-full">
            <Heart className="w-4 h-4 mr-2" />
            Subscribe to Updates
          </Button>
          <div className="text-xs text-gray-500 text-center">
            Get notified about campaign milestones and team updates
          </div>
        </div>
      </Card>

      {/* Share Campaign */}
      <Card className="p-6">
        <Button onClick={handleShare} variant="outline" className="w-full">
          <Share2 className="w-4 h-4 mr-2" />
          Share This Campaign
        </Button>
        <div className="text-xs text-gray-500 text-center mt-2">
          Help spread the word about {campaign.team}
        </div>
      </Card>
    </div>
  )
}