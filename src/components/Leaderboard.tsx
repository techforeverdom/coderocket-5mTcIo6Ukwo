import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Trophy, TrendingUp, Crown, Medal, Award } from 'lucide-react'

export function Leaderboard() {
  const topTeams = [
    {
      rank: 1,
      name: "Warriors Football",
      school: "Central High School",
      sport: "Football",
      raised: 52750,
      goal: 60000,
      supporters: 428,
      image: "https://picsum.photos/id/342/60/60"
    },
    {
      rank: 2,
      name: "Lions Soccer",
      school: "Westside Academy",
      sport: "Soccer",
      raised: 38200,
      goal: 45000,
      supporters: 312,
      image: "https://picsum.photos/id/244/60/60"
    },
    {
      rank: 3,
      name: "Tigers Baseball",
      school: "North Valley High",
      sport: "Baseball",
      raised: 32100,
      goal: 40000,
      supporters: 198,
      image: "https://picsum.photos/id/188/60/60"
    },
    {
      rank: 4,
      name: "Eagles Basketball",
      school: "Lincoln High School",
      sport: "Basketball",
      raised: 18750,
      goal: 35000,
      supporters: 247,
      image: "https://picsum.photos/id/431/60/60",
      isCurrentTeam: true
    },
    {
      rank: 5,
      name: "Dolphins Swimming",
      school: "Riverside High",
      sport: "Swimming",
      raised: 15900,
      goal: 25000,
      supporters: 156,
      image: "https://picsum.photos/id/367/60/60"
    }
  ]

  const topSupporters = [
    {
      rank: 1,
      name: "Lincoln Alumni Association",
      totalDonated: 5000,
      teamsSupported: 3,
      badge: "Platinum Supporter"
    },
    {
      rank: 2,
      name: "Johnson Family Foundation",
      totalDonated: 3500,
      teamsSupported: 5,
      badge: "Gold Supporter"
    },
    {
      rank: 3,
      name: "Local Sports Boosters",
      totalDonated: 2800,
      teamsSupported: 8,
      badge: "Gold Supporter"
    },
    {
      rank: 4,
      name: "Mike & Sarah Thompson",
      totalDonated: 1500,
      teamsSupported: 2,
      badge: "Silver Supporter"
    },
    {
      rank: 5,
      name: "Community Bank of Lincoln",
      totalDonated: 1200,
      teamsSupported: 4,
      badge: "Silver Supporter"
    }
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Platinum Supporter":
        return "bg-purple-100 text-purple-800"
      case "Gold Supporter":
        return "bg-yellow-100 text-yellow-800"
      case "Silver Supporter":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-900">Leaderboard</h3>
      </div>

      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teams">Top Teams</TabsTrigger>
          <TabsTrigger value="supporters">Top Supporters</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4 mt-6">
          <div className="space-y-3">
            {topTeams.map((team) => (
              <div 
                key={team.rank} 
                className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                  team.isCurrentTeam 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(team.rank)}
                </div>

                <img 
                  src={team.image} 
                  alt={team.name}
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {team.name}
                    </h4>
                    {team.isCurrentTeam && (
                      <Badge variant="secondary" className="text-xs">Your Team</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {team.sport} • {team.school}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">
                      {team.supporters} supporters
                    </span>
                    <span className="text-sm text-gray-500">
                      {((team.raised / team.goal) * 100).toFixed(0)}% funded
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    ${team.raised.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    of ${team.goal.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center pt-4">
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All Teams
            </button>
          </div>
        </TabsContent>

        <TabsContent value="supporters" className="space-y-4 mt-6">
          <div className="space-y-3">
            {topSupporters.map((supporter) => (
              <div key={supporter.rank} className="flex items-center space-x-4 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(supporter.rank)}
                </div>

                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {supporter.name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {supporter.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Supported {supporter.teamsSupported} teams
                  </p>
                  <Badge className={`text-xs mt-1 ${getBadgeColor(supporter.badge)}`}>
                    {supporter.badge}
                  </Badge>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    ${supporter.totalDonated.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    total donated
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center pt-4">
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All Supporters
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}