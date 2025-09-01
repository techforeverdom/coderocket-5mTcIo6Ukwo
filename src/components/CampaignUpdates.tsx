import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar, MessageCircle } from 'lucide-react'

export function CampaignUpdates() {
  const updates = [
    {
      id: 1,
      title: "Big Win Against Regional Rivals - Championship Dreams Alive!",
      content: "What an incredible game last night! The Eagles defeated the Riverside Hawks 78-72 in a thrilling overtime match. This victory secures our spot in the regional finals and brings us one step closer to state championships...",
      date: "2 days ago",
      comments: 24
    },
    {
      id: 2,
      title: "New Equipment Arrived - Thank You Supporters!",
      content: "Thanks to your generous donations, we've been able to purchase new practice jerseys and training equipment. The team is more motivated than ever, and we can see the difference in our performance...",
      date: "1 week ago",
      comments: 18
    },
    {
      id: 3,
      title: "Season Kickoff - Meet Your Eagles Basketball Team",
      content: "Welcome to our fundraising campaign! We're the Lincoln High Eagles basketball team, and we're working hard to make it to the state championships. Meet our dedicated players and coaching staff...",
      date: "3 weeks ago",
      comments: 42
    }
  ]

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Team Updates</h3>
      
      <div className="space-y-6">
        {updates.map((update) => (
          <div key={update.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
                {update.title}
              </h4>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{update.date}</span>
              </Badge>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed">
              {update.content}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <button className="flex items-center space-x-1 hover:text-blue-600">
                <MessageCircle className="w-4 h-4" />
                <span>{update.comments} comments</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}