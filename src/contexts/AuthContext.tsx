import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'coach' | 'parent' | 'supporter' | 'admin'
  team?: string
  position?: string
  phone?: string
  school?: string
  sport?: string
  profileImage?: string
  verified: boolean
  twoFactorEnabled?: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'student' | 'coach' | 'parent' | 'supporter'
  team?: string
  position?: string
  phone?: string
}

interface LoginData {
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isAdmin: boolean
  getAllUsers: () => User[]
  updateUserRole: (userId: string, role: User['role']) => void
  updateUser: (userId: string, updates: Partial<User>) => void
  deleteUser: (userId: string) => void
  toggleUserVerification: (userId: string) => void
  checkEmailExists: (email: string, excludeUserId?: string) => boolean
  checkPhoneExists: (phone: string, excludeUserId?: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'believefundraising_users'
const CURRENT_USER_KEY = 'believefundraising_current_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Load users and current user from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEY)
    const savedCurrentUser = localStorage.getItem(CURRENT_USER_KEY)
    
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers)
        setUsers(parsedUsers)
      } catch (error) {
        console.error('Error parsing saved users:', error)
        initializeDefaultUsers()
      }
    } else {
      initializeDefaultUsers()
    }

    if (savedCurrentUser) {
      try {
        const parsedUser = JSON.parse(savedCurrentUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing current user:', error)
      }
    }

    setLoading(false)
  }, [])

  const initializeDefaultUsers = () => {
    const defaultUsers: User[] = [
      {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@believefundraising.com',
        role: 'admin',
        phone: '(555) 000-0001',
        verified: true,
        twoFactorEnabled: false,
        profileImage: 'https://picsum.photos/id/64/32/32'
      },
      {
        id: 'coach-1',
        name: 'Coach Johnson',
        email: 'coach.johnson@lincolnhigh.edu',
        role: 'coach',
        team: 'Eagles Basketball Team',
        school: 'Lincoln High School',
        sport: 'Basketball',
        phone: '(555) 123-4567',
        verified: true,
        twoFactorEnabled: true,
        profileImage: 'https://picsum.photos/id/91/32/32'
      },
      {
        id: 'student-1',
        name: 'Alex Thompson',
        email: 'alex.thompson@student.lincolnhigh.edu',
        role: 'student',
        team: 'Eagles Basketball Team',
        school: 'Lincoln High School',
        sport: 'Basketball',
        position: 'Point Guard',
        phone: '(555) 234-5678',
        verified: true,
        twoFactorEnabled: false,
        profileImage: 'https://picsum.photos/id/22/32/32'
      },
      {
        id: 'parent-1',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        role: 'parent',
        phone: '(555) 345-6789',
        verified: true,
        twoFactorEnabled: false,
        profileImage: 'https://picsum.photos/id/65/32/32'
      },
      {
        id: 'supporter-1',
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        role: 'supporter',
        phone: '(555) 456-7890',
        verified: true,
        twoFactorEnabled: false,
        profileImage: 'https://picsum.photos/id/32/32/32'
      }
    ]
    
    setUsers(defaultUsers)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers))
  }

  // Save users to localStorage whenever users change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    }
  }, [users])

  // Save current user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  }, [user])

  const checkEmailExists = (email: string, excludeUserId?: string) => {
    return users.some(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.id !== excludeUserId
    )
  }

  const checkPhoneExists = (phone: string, excludeUserId?: string) => {
    if (!phone) return false
    return users.some(u => 
      u.phone === phone && 
      u.id !== excludeUserId
    )
  }

  const login = async (data: LoginData) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const foundUser = users.find(u => u.email === data.email)
      if (foundUser) {
        setUser(foundUser)
      } else {
        throw new Error('Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check if email already exists
      if (checkEmailExists(data.email)) {
        throw new Error('An account with this email already exists')
      }

      // Check if phone already exists (if provided)
      if (data.phone && checkPhoneExists(data.phone)) {
        throw new Error('An account with this phone number already exists')
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        team: data.team,
        position: data.position,
        phone: data.phone,
        verified: false,
        twoFactorEnabled: false,
        profileImage: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/32/32`
      }

      setUsers(prev => [...prev, newUser])
      setUser(newUser)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  const getAllUsers = () => {
    return users
  }

  const updateUserRole = (userId: string, role: User['role']) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role } : u
    ))
    
    // Update current user if it's the same user
    if (user && user.id === userId) {
      setUser(prev => prev ? { ...prev, role } : null)
    }
  }

  const updateUser = (userId: string, updates: Partial<User>) => {
    // Check for email uniqueness if email is being updated
    if (updates.email && checkEmailExists(updates.email, userId)) {
      throw new Error('An account with this email already exists')
    }

    // Check for phone uniqueness if phone is being updated
    if (updates.phone && checkPhoneExists(updates.phone, userId)) {
      throw new Error('An account with this phone number already exists')
    }

    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    ))
    
    // Update current user if it's the same user
    if (user && user.id === userId) {
      setUser(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const deleteUser = (userId: string) => {
    // Prevent deleting current user or main admin
    if (userId === user?.id || userId === 'admin-1') {
      throw new Error('Cannot delete this user')
    }

    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  const toggleUserVerification = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, verified: !u.verified } : u
    ))
    
    // Update current user if it's the same user
    if (user && user.id === userId) {
      setUser(prev => prev ? { ...prev, verified: !prev.verified } : null)
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAdmin,
      getAllUsers,
      updateUserRole,
      updateUser,
      deleteUser,
      toggleUserVerification,
      checkEmailExists,
      checkPhoneExists
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}