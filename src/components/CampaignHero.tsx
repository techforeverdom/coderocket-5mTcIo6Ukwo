import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Share2, Heart, Flag } from 'lucide-react'

export function CampaignHero() {
  const raised = 12750
  const goal = 25000
  const percentage = (raised / goal) * 100

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <img 
          src="https://picsum.photos/id/180/800/400" 
          alt="Campaign banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Help Sarah Complete Her Engineering Degree</h1>
            <p className="text-lg opacity-90">Supporting dreams through education funding</p>
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
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Follow
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
              <div className="text-3xl font-bold text-gray-900">${raised.toLocaleString()}</div>
              <div className="text-gray-600">raised of ${goal.toLocaleString()} goal</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-gray-900">127</div>
              <div className="text-gray-600">supporters</div>
            </div>
          </div>

          <Progress value={percentage} className="h-3" />

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{percentage.toFixed(1)}% funded</span>
            <span>23 days remaining</span>
          </div>
        </div>
      </div>
    </div>
  )
}