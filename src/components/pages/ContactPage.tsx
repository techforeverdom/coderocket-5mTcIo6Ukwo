import { useState } from 'react'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { MessageCircle, Send, CheckCircle, Mail, Phone, MapPin, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

export function ContactPage() {
  const { user, getAllUsers } = useAuth()
  const { sendEmailNotification, addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  })

  const categories = [
    'General Inquiry',
    'Technical Support',
    'Campaign Issues',
    'Payment Problems',
    'Account Issues',
    'Feature Request',
    'Bug Report',
    'Partnership Inquiry',
    'Media Inquiry',
    'Other'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const required = ['name', 'email', 'subject', 'category', 'message']
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`)
        return false
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address')
      return false
    }

    if (formData.message.length < 10) {
      alert('Please provide a more detailed message (at least 10 characters)')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      // Get all admin users
      const allUsers = getAllUsers()
      const adminUsers = allUsers.filter(u => u.role === 'admin')

      // Create ticket ID
      const ticketId = `TICKET-${Date.now()}`

      // Send email to all admins
      const subject = `[${formData.priority.toUpperCase()}] Contact Form: ${formData.subject}`
      const message = `
A new contact form submission has been received:

TICKET ID: ${ticketId}
PRIORITY: ${formData.priority.toUpperCase()}
CATEGORY: ${formData.category}

CONTACT INFORMATION:
- Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.phone || 'Not provided'}
- User ID: ${user?.id || 'Not logged in'}
- User Role: ${user?.role || 'Guest'}

SUBJECT: ${formData.subject}

MESSAGE:
${formData.message}

SUBMITTED: ${new Date().toLocaleString()}

Please respond to this inquiry promptly.

Believe Fundraising Group Contact System
      `

      // Send to all admins
      for (const admin of adminUsers) {
        await sendEmailNotification(admin.email, subject, message)
      }

      // Add notification to user if logged in
      if (user) {
        addNotification({
          userId: user.id,
          type: 'contact_response',
          title: 'Contact Form Submitted',
          message: `Your message "${formData.subject}" has been sent to our team. We'll respond within 24 hours.`,
          read: false
        })
      }

      setSubmitted(true)
    } catch (error) {
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We've received your message and will respond within 24 hours.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Our team will review your message within 2-4 hours</li>
                <li>• You'll receive a response via email within 24 hours</li>
                <li>• For urgent issues, we may contact you by phone</li>
                <li>• You can check your notifications for updates</li>
              </ul>
            </div>
            <div className="space-x-4">
              <Button onClick={() => window.location.href = '/'}>
                Return to Dashboard
              </Button>
              <Button variant="outline" onClick={() => {
                setSubmitted(false)
                setFormData({
                  name: user?.name || '',
                  email: user?.email || '',
                  phone: user?.phone || '',
                  subject: '',
                  category: '',
                  message: '',
                  priority: 'normal'
                })
              }}>
                Send Another Message
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          </div>
          <p className="text-gray-600">
            Have a question, need support, or want to provide feedback? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - General inquiry</SelectItem>
                        <SelectItem value="normal">Normal - Standard support</SelectItem>
                        <SelectItem value="high">High - Urgent issue</SelectItem>
                        <SelectItem value="critical">Critical - System down</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Message Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Please provide detailed information about your inquiry, including any relevant campaign names, error messages, or steps you've already taken..."
                    rows={6}
                    required
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {formData.message.length}/500 characters minimum: 10
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button type="submit" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">support@believefundraising.com</div>
                    <div className="text-sm text-gray-500">We respond within 24 hours</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Phone</div>
                    <div className="text-gray-600">(555) 123-FUND</div>
                    <div className="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM EST</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Address</div>
                    <div className="text-gray-600">
                      123 Fundraising Ave<br />
                      Suite 100<br />
                      Support City, SC 12345
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Business Hours */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Support Hours</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Monday - Friday: 9:00 AM - 6:00 PM EST</div>
                  <div>Saturday: 10:00 AM - 4:00 PM EST</div>
                  <div>Sunday: Closed</div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Emergency issues are monitored 24/7
                </div>
              </div>
            </Card>

            {/* FAQ Link */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Help</h3>
              <p className="text-gray-600 text-sm mb-4">
                Before contacting us, you might find your answer in our frequently asked questions.
              </p>
              <Button variant="outline" className="w-full">
                View FAQ
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}