import { Header } from '../Header'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { MapPin, Users, TrendingUp, Trophy } from 'lucide-react'

export function StudentsPage() {
  const teams = [
    {
      id: 1,
      name: "Eagles Basketball",
      school: "Lincoln High School",
      sport: "Basketball",
      coach: "Coach Johnson",
      location: "Lincoln, Nebraska",
      raised: 18750,
      goal: 35000,
      image: "https://picsum.photos/id/431/120/120",
      verified: true
    },
    {
      id: 2,
      name: "Warriors Football",
      school: "Central High School",
      sport: "Football",
      coach: "Coach Martinez",
      location: "Central City, NE",
      raised: 52750,
      goal: 60000,
      image: "https://picsum.photos/id/342/120/120",
      verified: true
    },
    {
      id: 3,
      name: "Lions Soccer",
      school: "Westside Academy",
      sport: "Soccer",
      coach: "Coach Thompson",
      location: "Westside, NE",
      raised: 38200,
      goal: 45000,
      image: "https://picsum.photos/id/244/120/120",
      verified: true
    }
  ]

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
          {teams.map((team) => (
            <Card key={team.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <img 
                  src={team.image} 
                  alt={team.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    {team.verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
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
                  <span className="text-sm">Coach: {team.coach}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{team.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">
                    ${team.raised.toLocaleString()} raised of ${team.goal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full">
                  Support Team
                </Button>
                <Button variant="outline" className="w-full">
                  Follow Team
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}