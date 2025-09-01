import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Search, Filter, Eye, Edit, Trash2, Play, Pause, Shield } from 'lucide-react'
import { useCampaigns } from '../../contexts/CampaignContext'

export function ManageCampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { campaigns, deleteCampaign, updateCampaignStatus } = useCampaigns()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-800">Paused</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleStatusChange = (campaignId: string, newStatus: 'active' | 'pending' | 'paused' | 'completed') => {
    try {
      updateCampaignStatus(campaignId, newStatus)
      alert(`Campaign status updated to ${newStatus}`)
    } catch (error) {
      alert('Failed to update campaign status')
    }
  }

  const handleDelete = (campaignId: string, campaignTitle: string) => {
    if (confirm(`Are you sure you want to delete "${campaignTitle}"? This action cannot be undone.`)) {
      try {
        deleteCampaign(campaignId)
        alert('Campaign deleted successfully')
      } catch (error) {
        alert('Failed to delete campaign')
      }
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.school.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Manage Campaigns</h1>
          </div>
          <p className="text-gray-600">
            Oversee all fundraising campaigns, manage their status, and maintain quality control
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns, teams, or schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Campaigns Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Team & School</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{campaign.title}</div>
                        <div className="text-sm text-gray-500">{campaign.sport}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{campaign.team}</div>
                      <div className="text-sm text-gray-500">{campaign.school}</div>
                      <div className="text-xs text-gray-400">{campaign.supporters} supporters</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium">
                        ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((campaign.raised / campaign.goal) * 100).toFixed(1)}% funded
                      </div>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(campaign.status)}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{campaign.created}</div>
                      <div className="text-xs text-gray-500">Deadline: {campaign.deadline}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        <Link to={`/team/${campaign.id}`}>
                          <Button variant="ghost" size="sm" title="View Campaign">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/admin/edit-campaign/${campaign.id}`}>
                          <Button variant="ghost" size="sm" title="Edit Campaign">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        {campaign.status === 'active' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Pause Campaign"
                            onClick={() => handleStatusChange(campaign.id, 'paused')}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Activate Campaign"
                            onClick={() => handleStatusChange(campaign.id, 'active')}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          title="Delete Campaign"
                          onClick={() => handleDelete(campaign.id, campaign.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No campaigns found matching your criteria.
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}