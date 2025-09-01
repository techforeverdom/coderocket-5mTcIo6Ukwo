import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Link } from 'react-router-dom'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Settings,
  FileText,
  ClipboardList,
  Shield,
  BarChart3
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCampaigns } from '../../contexts/CampaignContext'
import { useCampaignRequests } from '../../contexts/CampaignRequestContext'

export function AdminDashboard() {
  const { getAllUsers } = useAuth()
  const { campaigns } = useCampaigns()
  const { requests } = useCampaignRequests()
  
  const allUsers = getAllUsers()
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0)
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goal, 0)
  const totalSupporters = campaigns.reduce((sum, campaign) => sum + campaign.supporters, 0)
  const pendingRequests = requests.filter(r => r.status === 'pending').length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length

  const overallProgress = totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Manage campaigns, users, and platform settings
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{allUsers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="text-green-600">+{allUsers.filter(u => u.role === 'student').length}</span> students,{' '}
              <span className="text-blue-600">{allUsers.filter(u => u.role === 'coach').length}</span> coaches
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Raised</p>
                <p className="text-3xl font-bold text-gray-900">${totalRaised.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Goal: ${totalGoal.toLocaleString()}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{activeCampaigns}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {totalSupporters} total supporters
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">{pendingRequests}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-4">
              {pendingRequests > 0 ? (
                <Badge className="bg-orange-100 text-orange-800">Needs Review</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">All Clear</Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Platform Overview</h2>
            <BarChart3 className="w-6 h-6 text-gray-600" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Fundraising Progress</span>
                <span>{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-900">{campaigns.length}</div>
                <div className="text-blue-700">Total Campaigns</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-900">${totalRaised.toLocaleString()}</div>
                <div className="text-green-700">Funds Raised</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-900">{totalSupporters}</div>
                <div className="text-purple-700">Total Supporters</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link to="/admin/create-campaign">
                <Button className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
              </Link>
              <Link to="/admin/review-requests">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Review Campaign Requests
                  {pendingRequests > 0 && (
                    <Badge className="ml-auto bg-orange-100 text-orange-800">
                      {pendingRequests}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/admin/manage-users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/manage-campaigns">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Manage Campaigns
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">New campaign request</div>
                  <div className="text-xs text-gray-600">Eagles Basketball Team - 2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Campaign milestone reached</div>
                  <div className="text-xs text-gray-600">Warriors Football - 75% funded - 4 hours ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">New user registered</div>
                  <div className="text-xs text-gray-600">Coach Martinez - 6 hours ago</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}