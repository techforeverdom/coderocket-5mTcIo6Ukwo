import { Link } from 'react-router-dom'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { CheckCircle, Share2, Home } from 'lucide-react'

export function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">
            Your donation has been successfully processed. You'll receive a confirmation email shortly.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="text-green-800">
            <p className="font-semibold">Donation Details:</p>
            <p className="text-sm mt-1">Amount: $50.00</p>
            <p className="text-sm">Campaign: Help Sarah Complete Her Engineering Degree</p>
            <p className="text-sm">Transaction ID: TXN-123456789</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share This Campaign
          </Button>
          
          <Link to="/">
            <Button variant="outline" className="w-full">
              Return to Campaign
            </Button>
          </Link>
          
          <Link to="/campaigns">
            <Button variant="ghost" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Browse Other Campaigns
            </Button>
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            Questions about your donation?{' '}
            <a href="mailto:support@launchfundraising.com" className="text-blue-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}