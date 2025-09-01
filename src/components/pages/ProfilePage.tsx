import { useState } from 'react'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Avatar } from '../ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Shield,
  Camera
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    team: user?.team || '',
    school: user?.school || '',
    sport: user?.sport || '',
    position: user?.position || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateUser(user.id, formData)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      team: user?.team || '',
      school: user?.school || '',
      sport: user?.sport || '',
      position: user?.position || ''
    })
    setIsEditing(false)
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Student Athlete'
      case 'coach': return 'Coach'
      case 'parent': return 'Parent'
      case 'supporter': return 'Community Supporter'
      case 'admin': return 'Administrator'
      default: return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'coach': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      case 'parent': return 'bg-purple-100 text-purple-800'
      case 'supporter': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <img 
                      src={user.profileImage || "https://picsum.photos/id/64/96/96"} 
                      alt={user.name}
                      className="rounded-full"
                    />
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{user.name}</h2>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {getRoleDisplayName(user.role)}
                </Badge>
                
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center justify-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  {(user.team || user.school) && (
                    <div className="flex items-center justify-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {user.team || user.school}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-center space-x-2">
                  {user.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {user.twoFactorEnabled && (
                    <Badge className="bg-blue-100 text-blue-800">
                      2FA Enabled
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} size="sm" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <p className="mt-1 text-sm text-gray-900">{getRoleDisplayName(user.role)}</p>
                </div>

                {(user.role === 'student' || user.role === 'coach') && (
                  <>
                    <div>
                      <Label htmlFor="team">Team</Label>
                      {isEditing ? (
                        <Input
                          id="team"
                          value={formData.team}
                          onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                          placeholder="Enter your team name"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{user.team || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="school">School</Label>
                      {isEditing ? (
                        <Input
                          id="school"
                          value={formData.school}
                          onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                          placeholder="Enter your school name"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{user.school || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="sport">Sport</Label>
                      {isEditing ? (
                        <Input
                          id="sport"
                          value={formData.sport}
                          onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                          placeholder="Enter your sport"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{user.sport || 'Not specified'}</p>
                      )}
                    </div>

                    {user.role === 'student' && (
                      <div>
                        <Label htmlFor="position">Position</Label>
                        {isEditing ? (
                          <Input
                            id="position"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="Enter your position"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-gray-900">{user.position || 'Not specified'}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}