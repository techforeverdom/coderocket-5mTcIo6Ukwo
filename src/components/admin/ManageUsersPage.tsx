import { useState } from 'react'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar } from '../ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Trash2, Shield, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function ManageUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { getAllUsers, updateUserRole, deleteUser, toggleUserVerification, user: currentUser } = useAuth()
  
  const allUsers = getAllUsers()

  const handleRoleChange = (userId: string, newRole: string) => {
    if (userId === currentUser?.id && newRole !== 'admin') {
      alert('You cannot change your own admin role')
      return
    }
    updateUserRole(userId, newRole as 'student' | 'coach' | 'parent' | 'supporter' | 'admin')
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account')
      return
    }
    
    if (userId === 'admin-1') {
      alert('Cannot delete the main admin account')
      return
    }

    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        deleteUser(userId)
        alert('User deleted successfully')
      } catch (error) {
        alert('Failed to delete user')
      }
    }
  }

  const handleToggleVerification = (userId: string) => {
    toggleUserVerification(userId)
  }

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && user.verified) ||
                         (statusFilter === 'unverified' && !user.verified)
    return matchesSearch && matchesRole && matchesStatus
  })

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
      case 'student': return 'Student'
      case 'coach': return 'Coach'
      case 'parent': return 'Parent'
      case 'supporter': return 'Supporter'
      case 'admin': return 'Admin'
      default: return role
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          </div>
          <p className="text-gray-600">
            View and manage all platform users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{allUsers.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{allUsers.filter(u => u.role === 'student').length}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{allUsers.filter(u => u.role === 'coach').length}</div>
              <div className="text-sm text-gray-600">Coaches</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{allUsers.filter(u => u.role === 'parent').length}</div>
              <div className="text-sm text-gray-600">Parents</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{allUsers.filter(u => u.role === 'supporter').length}</div>
              <div className="text-sm text-gray-600">Supporters</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="supporter">Supporter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Team/Organization</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <img 
                            src={user.profileImage || "https://picsum.photos/id/64/40/40"} 
                            alt={user.name}
                            className="rounded-full"
                          />
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={user.id === currentUser?.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="coach">Coach</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="supporter">Supporter</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{user.team || user.school || '-'}</div>
                      {user.position && (
                        <div className="text-sm text-gray-500">{user.position}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Badge className={user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {user.verified ? 'Verified' : 'Pending'}
                        </Badge>
                        {user.twoFactorEnabled && (
                          <div className="flex items-center" title="2FA Enabled">
                            <Shield className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">Jan 15, 2024</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVerification(user.id)}
                          title={user.verified ? 'Unverify user' : 'Verify user'}
                        >
                          {user.verified ? (
                            <UserX className="w-4 h-4 text-orange-600" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        {user.id !== currentUser?.id && user.id !== 'admin-1' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}