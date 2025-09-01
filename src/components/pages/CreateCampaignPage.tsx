import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Shield, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Header } from '../Header'

export function CreateCampaignPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Campaign creation is restricted to administrators only. This ensures quality control and proper oversight of all fundraising campaigns.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Only administrators can create new campaigns</span>
            </div>
            
            <div className="pt-4">
              <Link to="/campaigns">
                <Button>
                  Browse Existing Campaigns
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}