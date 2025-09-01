import { Link } from 'react-router-dom'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { XCircle, ArrowLeft, Home } from 'lucide-react'

export function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">
            Your donation was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Campaign
            </Button>
          </Link>
          
          <Link to="/campaigns">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Browse Other Campaigns
            </Button>
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            If you experienced any issues during the payment process, please{' '}
            <a href="mailto:support@launchfundraising.com" className="text-blue-600 hover:underline">
              contact our support team
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  )
}