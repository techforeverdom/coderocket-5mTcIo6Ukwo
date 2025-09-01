import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ArrowLeft, Mail, Phone, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { getAllUsers } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!identifier.trim()) {
      setError('Please enter your email address or phone number')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const allUsers = getAllUsers()
      const foundUser = allUsers.find(user => 
        user.email.toLowerCase() === identifier.toLowerCase().trim() || 
        user.phone === identifier.trim()
      )

      if (foundUser) {
        // In a real app, this would send an actual email/SMS
        console.log(`Password reset requested for user: ${foundUser.email}`)
        setSuccess(true)
      } else {
        setError('No account found with that email address or phone number')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isEmail = (str: string) => {
    return str.includes('@') && str.includes('.')
  }

  const isPhone = (str: string) => {
    return /^[\+]?[1-9][\d]{0,15}$/.test(str.replace(/[\s\-\(\)]/g, ''))
  }

  const getInputType = () => {
    if (!identifier) return 'text'
    if (isEmail(identifier)) return 'email'
    if (isPhone(identifier)) return 'tel'
    return 'text'
  }

  const getPlaceholder = () => {
    return 'Enter your email or phone number'
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Messages</h1>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to{' '}
              {isEmail(identifier) ? 'your email address' : 'your phone number'}.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Didn't receive it? Check your spam folder or try again in a few minutes.
            </p>
            <Link to="/login">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600">
            Enter your email or phone number and we'll send you reset instructions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="identifier">Email or Phone Number</Label>
            <div className="relative">
              <Input
                id="identifier"
                type={getInputType()}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={getPlaceholder()}
                className="pl-10"
                required
              />
              <div className="absolute left-3 top-3">
                {isEmail(identifier) ? (
                  <Mail className="w-4 h-4 text-gray-400" />
                ) : (
                  <Phone className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Instructions...
              </>
            ) : (
              'Send Reset Instructions'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  )
}