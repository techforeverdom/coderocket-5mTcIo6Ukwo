import { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { CreditCard, Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

interface StripePaymentProps {
  amount: number
  campaignId: string
  campaignTitle: string
  onSuccess: () => void
  onCancel: () => void
}

export function StripePayment({ amount, campaignId, campaignTitle, onSuccess, onCancel }: StripePaymentProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: '',
    anonymous: false
  })
  const { user } = useAuth()
  const { sendDonationConfirmation } = useNotifications()

  const handleInputChange = (field: string, value: string | boolean) => {
    setPaymentData(prev => ({ ...prev, [field]: value }))
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const validatePayment = () => {
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.name) {
      alert('Please fill in all payment fields')
      return false
    }

    if (!paymentData.email && !user?.email) {
      alert('Please provide an email address')
      return false
    }

    return true
  }

  const handlePayment = async () => {
    if (!validatePayment()) return

    setLoading(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Send donation confirmation
      const donorEmail = paymentData.email || user?.email || ''
      const donorName = paymentData.anonymous ? 'Anonymous Donor' : (paymentData.name || user?.name || 'Anonymous')
      
      await sendDonationConfirmation(donorEmail, amount, campaignTitle, donorName)
      
      setStep(2)
    } catch (error) {
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">
              Your donation of <strong>${amount}</strong> to <strong>{campaignTitle}</strong> has been processed successfully.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              You'll receive a confirmation email shortly with your donation receipt.
            </p>
          </div>

          <Button onClick={onSuccess} className="w-full">
            Return to Campaign
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Complete Your Donation</h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-blue-900 font-medium">Donation Amount:</span>
          <span className="text-2xl font-bold text-blue-900">${amount}</span>
        </div>
        <div className="text-blue-700 text-sm mt-1">to {campaignTitle}</div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-4">
        {/* Card Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Payment Information</h3>
            <Lock className="w-4 h-4 text-green-600" />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              value={paymentData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                value={paymentData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                value={paymentData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Cardholder Name</Label>
            <Input
              id="name"
              type="text"
              value={paymentData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900">Contact Information</h3>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={paymentData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={user?.email || "your.email@example.com"}
            />
            <div className="text-xs text-gray-500 mt-1">
              For donation receipt and updates
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={paymentData.anonymous}
              onChange={(e) => handleInputChange('anonymous', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="anonymous" className="text-sm">
              Make this donation anonymous
            </Label>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Secure Payment</span>
          </div>
          <p className="text-xs text-gray-600">
            Your payment information is encrypted and secure. We use Stripe for payment processing.
          </p>
        </div>

        <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Donate ${amount}
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}