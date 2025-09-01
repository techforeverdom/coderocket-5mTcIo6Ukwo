import { useState } from 'react'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Avatar } from '../ui/avatar'
import { User, Mail, Phone, Shield, Camera, Save, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    team: user?.team || '',
    school: user?.school || '',
    sport: user?.sport || '',
    position: user?.position || ''
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to view your profile.</p>
          </Card>
        </main>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      updateUser(user.id, {
        name: formData.name,
        phone: formData.phone,
        team: formData.team,
        school: formData.school,
        sport: formData.sport,
        position: formData.position
      })
      
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24">
                    <img 
                      src={user.profileImage || "https://picsum.photos/id/64/96/96"} 
                      alt="Profile" 
                      className="rounded-full"
                    />
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full bg-white shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">{user.name}</h2>
                <Badge className={`mb-4 ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </Badge>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center justify-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.twoFactorEnabled && (
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">2FA Enabled</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <Button
                  variant={editing ? "ghost" : "outline"}
                  onClick={() => setEditing(!editing)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editing ? formData.name : user.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editing ? formData.phone : (user.phone || '')}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!editing}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={getRoleDisplayName(user.role)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                {/* Team Information - Show for students and coaches */}
                {(user.role === 'student' || user.role === 'coach') && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Team Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="team">Team Name</Label>
                        <Input
                          id="team"
                          value={editing ? formData.team : (user.team || '')}
                          onChange={(e) => handleInputChange('team', e.target.value)}
                          disabled={!editing}
                          placeholder="Enter team name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="school">School/Organization</Label>
                        <Input
                          id="school"
                          value={editing ? formData.school : (user.school || '')}
                          onChange={(e) => handleInputChange('school', e.target.value)}
                          disabled={!editing}
                          placeholder="Enter school name"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <Label htmlFor="sport">Sport</Label>
                        <Input
                          id="sport"
                          value={editing ? formData.sport : (user.sport || '')}
                          onChange={(e) => handleInputChange('sport', e.target.value)}
                          disabled={!editing}
                          placeholder="e.g., Basketball"
                        />
                      </div>
                      {user.role === 'student' && (
                        <div>
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            value={editing ? formData.position : (user.position || '')}
                            onChange={(e) => handleInputChange('position', e.target.value)}
                            disabled={!editing}
                            placeholder="e.g., Point Guard"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Security Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-600">
                          {user.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security to your account'}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {user.twoFactorEnabled ? 'Manage' : 'Enable'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Password</div>
                        <div className="text-sm text-gray-600">Change your account password</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {editing && (
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}