import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Upload, DollarSign, Target, Calendar, Shield } from 'lucide-react'
import { useCampaigns } from '../../contexts/CampaignContext'

export function CreateCampaignPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    sport: '',
    deadline: '',
    story: '',
    team: '',
    school: '',
    coachName: '',
    coachEmail: '',
    status: 'pending' as 'active' | 'pending'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { addCampaign } = useCampaigns()
  const navigate = useNavigate()

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Campaign title is required')
      return false
    }
    if (!formData.team.trim()) {
      setError('Team name is required')
      return false
    }
    if (!formData.school.trim()) {
      setError('School/Organization is required')
      return false
    }
    if (!formData.coachName.trim()) {
      setError('Coach name is required')
      return false
    }
    if (!formData.coachEmail.trim()) {
      setError('Coach email is required')
      return false
    }
    if (!formData.goal || parseInt(formData.goal) <= 0) {
      setError('Valid fundraising goal is required')
      return false
    }
    if (!formData.sport) {
      setError('Sport selection is required')
      return false
    }
    if (!formData.deadline) {
      setError('Campaign deadline is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Campaign description is required')
      return false
    }
    if (!formData.story.trim()) {
      setError('Team story is required')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.coachEmail)) {
      setError('Please enter a valid coach email address')
      return false
    }
    
    const deadlineDate = new Date(formData.deadline)
    const today = new Date()
    if (deadlineDate <= today) {
      setError('Campaign deadline must be in the future')
      return false
    }
    
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      // Generate a random image for the campaign
      const imageId = Math.floor(Math.random() * 1000) + 100
      
      addCampaign({
        title: formData.title,
        team: formData.team,
        school: formData.school,
        sport: formData.sport,
        goal: parseInt(formData.goal),
        status: formData.status,
        image: `https://picsum.photos/id/${imageId}/800/400`,
        description: formData.description,
        story: formData.story,
        deadline: formData.deadline,
        coachName: formData.coachName,
        coachEmail: formData.coachEmail
      })
      
      alert('Campaign created successfully!')
      navigate('/admin/manage-campaigns')
    } catch (error) {
      setError('Failed to create campaign. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Create Team Campaign</h1>
          </div>
          <p className="text-gray-600">
            As an administrator, you can create fundraising campaigns for sports teams
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Help Eagles Basketball Reach State Championships"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="team">Team Name *</Label>
                  <Input
                    id="team"
                    value={formData.team}
                    onChange={(e) => setFormData({...formData, team: e.target.value})}
                    placeholder="e.g., Eagles Basketball"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="school">School/Organization *</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                    placeholder="e.g., Lincoln High School"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coachName">Coach Name *</Label>
                  <Input
                    id="coachName"
                    value={formData.coachName}
                    onChange={(e) => setFormData({...formData, coachName: e.target.value})}
                    placeholder="e.g., Coach Johnson"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="coachEmail">Coach Email *</Label>
                  <Input
                    id="coachEmail"
                    type="email"
                    value={formData.coachEmail}
                    onChange={(e) => setFormData({...formData, coachEmail: e.target.value})}
                    placeholder="coach@school.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Briefly describe what the team is raising money for"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="goal">Fundraising Goal *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="goal"
                      type="number"
                      value={formData.goal}
                      onChange={(e) => setFormData({...formData, goal: e.target.value})}
                      placeholder="35000"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sport">Sport *</Label>
                  <Select value={formData.sport} onValueChange={(value) => setFormData({...formData, sport: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basketball">Basketball</SelectItem>
                      <SelectItem value="football">Football</SelectItem>
                      <SelectItem value="soccer">Soccer</SelectItem>
                      <SelectItem value="baseball">Baseball</SelectItem>
                      <SelectItem value="softball">Softball</SelectItem>
                      <SelectItem value="volleyball">Volleyball</SelectItem>
                      <SelectItem value="track">Track & Field</SelectItem>
                      <SelectItem value="swimming">Swimming</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="golf">Golf</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Initial Status *</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'pending') => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Campaign Deadline *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Story</h2>
            <div>
              <Label htmlFor="story">Tell the Team's Story *</Label>
              <Textarea
                id="story"
                value={formData.story}
                onChange={(e) => setFormData({...formData, story: e.target.value})}
                placeholder="Share the team's journey, goals, achievements, and why supporters should help fund this campaign..."
                rows={8}
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                A compelling story helps supporters connect with the team. Include achievements, challenges, and championship dreams.
              </p>
            </div>
          </Card>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-4 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="outline" type="button" onClick={() => navigate('/admin')}>
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={loading}>
              <Target className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}