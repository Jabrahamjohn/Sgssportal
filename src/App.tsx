import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard/Dashboard'
import MembersList from './pages/members/MembersList'
import MemberDetail from './pages/members/MemberDetail'
import NewMemberForm from './pages/members/NewMemberForm'
import AdminDashboard from './pages/admin/AdminDashboard'
import ReimbursementScales from './pages/admin/ReimbursementScales'
import MembershipTypes from './pages/admin/MembershipTypes'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import RoleSwitcher from './components/RoleSwitcher'
import MockUserBanner from './components/MockUserBanner'

export default function App() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<MembersList />} />
            <Route path="/members/new" element={<NewMemberForm />} />
            <Route path="/members/:id" element={<MemberDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/reimbursement-scales" element={<ReimbursementScales />} />
            <Route path="/admin/membership-types" element={<MembershipTypes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {/*Role Switcher and Mock User Banner */}
      <RoleSwitcher />
      <MockUserBanner />
    </div>
  )
}
