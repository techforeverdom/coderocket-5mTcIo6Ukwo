import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { MapPin, Users, Calendar, Trophy } from 'lucide-react'

export function TeamProfile() {
  return (
    <Card className="p-6">
      <div className="flex items-start space-x-6">
        <img 
          src="https://picsum.photos/id/431/120/120" 
          alt="Eagles Basketball"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Eagles Basketball Team</h2>
              <p className="text-gray-600">Lincoln High School Varsity Basketball</p>
            </div>
            <Badge variant="secondary">Verified Team</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>15 Team Members</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Lincoln, Nebraska</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Season: 2024-2025</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Recent Achievements</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Regional Champions 2024</Badge>
              <Badge variant="outline">Conference Winners</Badge>
              <Badge variant="outline">State Qualifier</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About Our Team</h3>
            <p className="text-gray-700 leading-relaxed">
              The Lincoln High Eagles basketball team has been working tirelessly to reach the state championships. 
              We need your support to cover travel expenses, equipment upgrades, and tournament fees. Our dedicated 
              players have maintained excellent grades while training hard to represent our school and community 
              at the highest level of competition.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}