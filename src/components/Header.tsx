import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar } from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Bell, Search, Menu, Plus, LogOut, User, Settings, Shield, Users, FileText, ClipboardList, X, ExternalLink, Trash2, CheckCheck, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCampaigns } from '../contexts/CampaignContext'
import { useNotifications } from '../contexts/NotificationContext'

export function Header() {
  const { user, logout, isAdmin } = useAuth()
  const { campaigns } = useCampaigns()
  const { getUserNotifications, unreadCount, markAsRead, removeNotification, markAllAsRead } = useNotifications()
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/campaigns?search=${encodeURIComponent(searchTerm.trim())}`)
      setShowSearch(false)
      setSearchTerm('')
    }
  }

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.sport.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5)

  const userNotifications = user ? getUserNotifications(user.id) : []

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      setShowNotifications(false)
    } else if (notification.relatedId) {
      navigate(`/team/${notification.relatedId}`)
      setShowNotifications(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'donation': return '💰'
      case 'milestone': return '🎯'
      case 'team_update': return '📢'
      case 'account': return '👤'
      case 'system': return '⚙️'
      case 'contact_response': return '📧'
      default: return '📢'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Believe Fundraising Group</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
            <Link to="/campaigns" className="text-gray-700 hover:text-blue-600 font-medium">Campaigns</Link>
            <Link to="/teams" className="text-gray-700 hover:text-blue-600 font-medium">Teams</Link>
            <Link to="/request-campaign" className="text-gray-700 hover:text-blue-600 font-medium">Request Campaign</Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact Us</Link>
            {isAdmin && (
              <Link to="/admin" className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-4 h-4" />
              </Button>
              
              {showSearch && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <form onSubmit={handleSearch} className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search campaigns, teams, schools..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-10"
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-8 w-8 p-0"
                          onClick={() => {
                            setShowSearch(false)
                            setSearchTerm('')
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                    
                    {searchTerm && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 mb-2">
                          {filteredCampaigns.length > 0 ? 'Search Results:' : 'No results found'}
                        </div>
                        {filteredCampaigns.map(campaign => (
                          <Link
                            key={campaign.id}
                            to={`/team/${campaign.id}`}
                            className="block p-2 hover:bg-gray-50 rounded-md"
                            onClick={() => {
                              setShowSearch(false)
                              setSearchTerm('')
                            }}
                          >
                            <div className="font-medium text-gray-900">{campaign.title}</div>
                            <div className="text-sm text-gray-500">{campaign.team} • {campaign.school}</div>
                          </Link>
                        ))}
                        {searchTerm && filteredCampaigns.length > 0 && (
                          <Link
                            to={`/campaigns?search=${encodeURIComponent(searchTerm)}`}
                            className="block p-2 text-center text-blue-600 hover:bg-blue-50 rounded-md text-sm"
                            onClick={() => {
                              setShowSearch(false)
                              setSearchTerm('')
                            }}
                          >
                            View all results for "{searchTerm}"
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            title="Mark all as read"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNotifications(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {userNotifications.length > 0 ? (
                        userNotifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`group relative p-3 rounded-lg border cursor-pointer transition-colors ${
                              !notification.read 
                                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </div>
                                  <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                                    {notification.message}
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="text-gray-400 text-xs">
                                      {formatTimeAgo(notification.timestamp)}
                                    </div>
                                    {notification.actionUrl && (
                                      <ExternalLink className="w-3 h-3 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeNotification(notification.id)
                                  }}
                                  title="Remove notification"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {isAdmin && (
              <Link to="/admin/create-campaign">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <img src={user?.profileImage || "https://picsum.photos/id/64/32/32"} alt="Profile" className="rounded-full" />
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/request-campaign" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Request Campaign
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contact" className="flex items-center">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Us
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/manage-users" className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/review-requests" className="flex items-center">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Review Requests
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showSearch || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowSearch(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}