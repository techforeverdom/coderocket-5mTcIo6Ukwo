import { Link } from 'react-router-dom'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { MapPin, Users, TrendingUp, Trophy } from 'lucide-react'
import { useCampaigns } from '../../contexts/CampaignContext'

export function TeamsPage() {
  const { campaigns } = useCampaigns()
  
  // Only show active campaigns as teams
  const activeTeams = campaigns.filter(campaign => campaign.status === 'active')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sports Teams</h1>
          <p className="text-gray-600">
            Discover amazing sports teams working towards their championship goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTeams.map((team) => (
            <Card key={team.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <img 
                  src={team.image} 
                  alt={team.team}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{team.team}</h3>
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{team.sport}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{team.school}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">Coach: {team.coachName || 'Team Staff'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">
                    ${team.raised.toLocaleString()} raised of ${team.goal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link to={`/team/${team.id}`}>
                  <Button className="w-full">
                    Support Team
                  </Button>
                </Link>
                <Link to={`/team/${team.id}`}>
                  <Button variant="outline" className="w-full">
                    View Campaign
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {activeTeams.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Teams</h3>
            <p className="text-gray-600">There are currently no active team campaigns.</p>
          </div>
        )}
      </main>
    </div>
  )
}