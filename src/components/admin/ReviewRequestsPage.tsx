import { useState } from 'react'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Search, Filter, Eye, Check, X, Clock, FileText, Mail, Globe, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { useCampaignRequests } from '../../contexts/CampaignRequestContext'
import { useCampaigns } from '../../contexts/CampaignContext'
import { useNotifications } from '../../contexts/NotificationContext'

export function ReviewRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const { requests, updateRequestStatus } = useCampaignRequests()
  const { addCampaign } = useCampaigns()
  const { sendEmailNotification } = useNotifications()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'website': return <Globe className="w-4 h-4" />
      case 'facebook': return <Facebook className="w-4 h-4" />
      case 'instagram': return <Instagram className="w-4 h-4" />
      case 'twitter': return <Twitter className="w-4 h-4" />
      case 'youtube': return <Youtube className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const handleApprove = async (request: any) => {
    try {
      // Create the campaign
      addCampaign({
        title: request.campaignTitle,
        team: request.teamName,
        school: request.school,
        sport: request.sport,
        goal: request.goalAmount,
        status: 'active',
        image: 'https://picsum.photos/id/431/800/400', // Default image
        description: request.description,
        story: request.story,
        deadline: request.deadline,
        coachName: request.coachName,
        coachEmail: request.coachEmail,
        socialMedia: request.socialMedia
      })

      // Update request status
      updateRequestStatus(request.id, 'approved', reviewNotes)

      // Send approval email
      const subject = `Campaign Request Approved: ${request.campaignTitle}`
      const message = `
Great news! Your campaign request has been approved and is now live on Believe Fundraising Group.

CAMPAIGN DETAILS:
- Title: ${request.campaignTitle}
- Team: ${request.teamName}
- Goal: $${request.goalAmount.toLocaleString()}
- Start Date: ${request.startDate}
- Deadline: ${request.deadline}
- Status: Active

NEXT STEPS:
1. Your campaign is now visible to supporters
2. Share your campaign link with your community
3. Monitor progress through your dashboard
4. Keep supporters updated with regular posts

${reviewNotes ? `ADMIN NOTES:\n${reviewNotes}` : ''}

Campaign URL: ${window.location.origin}/campaigns

Thank you for using Believe Fundraising Group!

Best regards,
The Believe Fundraising Group Team
      `

      await sendEmailNotification(request.coachEmail, subject, message)
      
      alert('Campaign approved and created successfully!')
      setSelectedRequest(null)
      setReviewNotes('')
    } catch (error) {
      alert('Failed to approve campaign')
    }
  }

  const handleReject = async (request: any) => {
    if (!reviewNotes.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    try {
      // Update request status
      updateRequestStatus(request.id, 'rejected', reviewNotes)

      // Send rejection email
      const subject = `Campaign Request Update: ${request.campaignTitle}`
      const message = `
Thank you for submitting your campaign request to Believe Fundraising Group.

After careful review, we are unable to approve your campaign request at this time.

CAMPAIGN DETAILS:
- Title: ${request.campaignTitle}
- Team: ${request.teamName}
- Submitted: ${request.submittedAt}

REASON FOR DECISION:
${reviewNotes}

NEXT STEPS:
You may submit a revised campaign request addressing the concerns mentioned above. Please feel free to contact us if you have any questions or need assistance.

We appreciate your interest in using our platform and wish your team the best of luck.

Best regards,
The Believe Fundraising Group Team
      `

      await sendEmailNotification(request.coachEmail, subject, message)
      
      alert('Campaign rejected and notification sent')
      setSelectedRequest(null)
      setReviewNotes('')
    } catch (error) {
      alert('Failed to reject campaign')
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.school.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Review Campaign Requests</h1>
          </div>
          <p className="text-gray-600">
            Review and approve campaign requests from teams and coaches
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Requests Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Team & School</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Goal & Timeline</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.campaignTitle}</div>
                        <div className="text-sm text-gray-500">{request.sport}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{request.teamName}</div>
                      <div className="text-sm text-gray-500">{request.school}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium">${request.goalAmount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{request.startDate} - {request.deadline}</div>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">{request.submittedAt}</div>
                      <div className="text-xs text-gray-500">by {request.submitterName}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setSelectedRequest(request)
                                setReviewNotes('')
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedRequest(request)
                                setReviewNotes('')
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No campaign requests found.
            </div>
          )}
        </Card>

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.campaignTitle}</h2>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(selectedRequest.status)}
                    <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Team Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Team:</span> {selectedRequest.teamName}</div>
                      <div><span className="font-medium">School:</span> {selectedRequest.school}</div>
                      <div><span className="font-medium">Sport:</span> {selectedRequest.sport}</div>
                      <div><span className="font-medium">Goal:</span> ${selectedRequest.goalAmount.toLocaleString()}</div>
                      <div><span className="font-medium">Start Date:</span> {selectedRequest.startDate}</div>
                      <div><span className="font-medium">Deadline:</span> {selectedRequest.deadline}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Coach Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedRequest.coachName}</div>
                      <div><span className="font-medium">Email:</span> {selectedRequest.coachEmail}</div>
                      <div><span className="font-medium">Phone:</span> {selectedRequest.coachPhone || 'Not provided'}</div>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                {selectedRequest.socialMedia && Object.values(selectedRequest.socialMedia).some((url: any) => url) && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Social Media & Online Presence</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(selectedRequest.socialMedia).map(([platform, url]: [string, any]) => {
                        if (!url) return null
                        return (
                          <div key={platform} className="flex items-center space-x-2 text-sm">
                            {getSocialIcon(platform)}
                            <span className="font-medium capitalize">{platform}:</span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              {url}
                            </a>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedRequest.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Team Story</h3>
                    <p className="text-gray-700">{selectedRequest.story}</p>
                  </div>
                  {selectedRequest.expenses && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">How Funds Will Be Used</h3>
                      <p className="text-gray-700">{selectedRequest.expenses}</p>
                    </div>
                  )}
                  {selectedRequest.achievements && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Recent Achievements</h3>
                      <p className="text-gray-700">{selectedRequest.achievements}</p>
                    </div>
                  )}
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Review Decision</h3>
                    <div className="mb-4">
                      <Textarea
                        placeholder="Add review notes (required for rejection, optional for approval)"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-4">
                      <Button 
                        onClick={() => handleApprove(selectedRequest)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve Campaign
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleReject(selectedRequest)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject Request
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}