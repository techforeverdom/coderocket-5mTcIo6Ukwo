import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { BookOpen, DollarSign, Users, FileText, Video, Download } from 'lucide-react'

export function ResourcesPage() {
  const resources = [
    {
      category: "Campaign Creation",
      icon: <FileText className="w-6 h-6" />,
      items: [
        { title: "How to Write a Compelling Campaign Story", type: "Guide" },
        { title: "Setting Realistic Fundraising Goals", type: "Article" },
        { title: "Campaign Photo and Video Best Practices", type: "Video" }
      ]
    },
    {
      category: "Financial Planning",
      icon: <DollarSign className="w-6 h-6" />,
      items: [
        { title: "Understanding Student Loan Options", type: "Guide" },
        { title: "Scholarship Search Strategies", type: "Article" },
        { title: "Budgeting for College Expenses", type: "Calculator" }
      ]
    },
    {
      category: "Community Building",
      icon: <Users className="w-6 h-6" />,
      items: [
        { title: "Social Media Promotion Tips", type: "Guide" },
        { title: "Engaging with Donors", type: "Article" },
        { title: "Building Your Support Network", type: "Video" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Resources</h1>
          <p className="text-gray-600">
            Everything you need to create successful fundraising campaigns and achieve your educational goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {resources.map((category, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {category.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{category.category}</h2>
              </div>

              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                      <span className="text-sm text-gray-500">{item.type}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      {item.type === "Video" ? <Video className="w-4 h-4" /> : 
                       item.type === "Calculator" ? <BookOpen className="w-4 h-4" /> :
                       <Download className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Personal Help?</h2>
            <p className="text-gray-600 mb-6">
              Our team of fundraising experts is here to help you succeed. Schedule a free consultation to get personalized advice for your campaign.
            </p>
            <Button size="lg">
              Schedule Free Consultation
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}