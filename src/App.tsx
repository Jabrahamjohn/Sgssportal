import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import OutpatientClaimForm from './pages/claims/OutpatientClaimForm'
import MembersList from './pages/members/MembersList'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import { useAuth } from './hooks/useAuth'
import ReimbursementScales from './pages/admin/ReimbursementScales'
import NewMemberForm from './pages/members/NewMemberForm'
import MemberDetail from './pages/members/MemberDetail'

export default function App() {
  const { user } = useAuth() || { user: null }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/claims/outpatient" element={<OutpatientClaimForm />} />
            <Route path="/members" element={<MembersList />} />
            <Route path="/members/new" element={<NewMemberForm />} />
            <Route path="/members/:id" element={<MemberDetail />} />
            <Route path="/admin/reimbursement-scales" element={<ReimbursementScales />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
