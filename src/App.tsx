// src/App.tsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Layout & Components
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import RoleSwitcher from './components/RoleSwitcher'
import MockUserBanner from './components/MockUserBanner'
import EnvironmentBadge from './components/system/EnvironmentBadge'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
// Member Pages
import Dashboard from './pages/dashboard/Dashboard'
import MembersList from './pages/members/MembersList'
import MemberDetail from './pages/members/MemberDetail'
import NewMemberForm from './pages/members/NewMemberForm'

// Claims Pages
import ClaimsDashboard from './pages/claims/ClaimsDashboard'
import OutpatientClaimForm from './pages/claims/OutpatientClaimForm'
import InpatientClaimForm from './pages/claims/InpatientClaimForm'
import ChronicClaimForm from './pages/claims/ChronicClaimForm'
import ClaimHistory from './pages/claims/ClaimHistory'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ReimbursementScales from './pages/admin/ReimbursementScales'
import MembershipTypes from './pages/admin/MembershipTypes'
import ClaimsAdminPanel from './pages/admin/ClaimsAdminPanel'
import Reports from './pages/admin/Reports'
import ClaimDetailAdmin from './pages/admin/claimDetailAdmin'

console.log('✅ Connected to Supabase:', import.meta.env.VITE_SUPABASE_URL)

export default function App() {
  const { user, loading } = useAuth()

  // While Supabase session/user is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <div className="animate-pulse text-lg font-medium">Loading portal...</div>
      </div>
    )
  }

  // If no user, show login page
  if (!loading && !user) {
    return (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/*"
      element={
        user ? (
          <AuthenticatedLayout /> // extracted below
        ) : (
          <Navigate to="/login" replace />
        )
      }
    />
  </Routes>
    )

  }

  // Authenticated layout
  function AuthenticatedLayout() {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
        <main className="p-6 flex-1 overflow-y-auto">
          <Routes>
            {/* Member routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<MembersList />} />
            <Route path="/members/new" element={<NewMemberForm />} />
            <Route path="/members/:id" element={<MemberDetail />} />

            {/* Claims */}
            <Route path="/claims" element={<ClaimsDashboard />} />
            <Route path="/claims/outpatient" element={<OutpatientClaimForm />} />
            <Route path="/claims/inpatient" element={<InpatientClaimForm />} />
            <Route path="/claims/chronic" element={<ChronicClaimForm />} />
            <Route path="/claims/history" element={<ClaimHistory />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin', 'committee']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reimbursement-scales"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ReimbursementScales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/membership-types"
              element={
                <ProtectedRoute roles={['admin']}>
                  <MembershipTypes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/claims"
              element={
                <ProtectedRoute roles={['admin', 'committee']}>
                  <ClaimsAdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute roles={['admin', 'committee']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/claims/:claimId"
              element={
                <ProtectedRoute roles={['admin', 'committee']}>
                  <ClaimDetailAdmin />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <RoleSwitcher />
      <MockUserBanner />
      <EnvironmentBadge />
      </div>
    
    )
  }
}
// End of App.tsx