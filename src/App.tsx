import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CampaignProvider } from './contexts/CampaignContext'
import { CampaignRequestProvider } from './contexts/CampaignRequestContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage'
import { HomePage } from './components/pages/HomePage'
import { ProfilePage } from './components/pages/ProfilePage'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { ManageUsersPage } from './components/admin/ManageUsersPage'

function App() {
  return (
    <AuthProvider>
      <CampaignProvider>
        <CampaignRequestProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/manage-users" element={
                <AdminRoute>
                  <ManageUsersPage />
                </AdminRoute>
              } />
            </Routes>
          </Router>
        </CampaignRequestProvider>
      </CampaignProvider>
    </AuthProvider>
  )
}

export default App