import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Shield, Smartphone, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

export function TwoFactorSetup() {
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, updateUser } = useAuth()
  const { sendSMSNotification, sendEmailNotification } = useNotifications()
  const navigate = useNavigate()

  const handleSendCode = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number')
      return
    }

    setLoading(true)
    try {
      const code = Math.random().toString().substring(2, 8)
      await sendSMSNotification(phoneNumber, `Your Believe Fundraising Group verification code is: ${code}`)
      
      // Also send email notification
      if (user?.email) {
        await sendEmailNotification(
          user.email,
          'Two-Factor Authentication Setup',
          `Your verification code is: ${code}. Enter this code to complete your 2FA setup.`
        )
      }
      
      setStep(2)
    } catch (error) {
      alert('Failed to send verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      alert('Please enter the verification code')
      return
    }

    setLoading(true)
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user with phone number and 2FA enabled
      if (user) {
        updateUser(user.id, { 
          phone: phoneNumber,
          twoFactorEnabled: true 
        })
      }
      
      setStep(3)
    } catch (error) {
      alert('Invalid verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-600">Secure your account with 2FA</p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <Smartphone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Add Your Phone Number</h2>
              <p className="text-gray-600 text-sm">
                We'll send you a verification code to confirm your phone number
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>

            <Button onClick={handleSendCode} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Enter Verification Code</h2>
              <p className="text-gray-600 text-sm">
                We sent a 6-digit code to {phoneNumber}
              </p>
            </div>

            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
            </div>

            <Button onClick={handleVerifyCode} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <Button variant="ghost" onClick={() => setStep(1)} className="w-full">
              Use Different Number
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Setup Complete!</h2>
              <p className="text-gray-600 text-sm">
                Two-factor authentication has been enabled for your account
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 text-sm">
                Your account is now more secure. You'll receive SMS codes when logging in from new devices.
              </p>
            </div>

            <Button onClick={handleComplete} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}