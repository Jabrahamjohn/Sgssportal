import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/classnames'
import { Home, Users, ClipboardList, Scale, Pill, FileText } from 'lucide-react'

export default function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname

  if (!user) return null // hide sidebar until user is loaded

  // Member menu
  const memberMenu = [
    { label: 'Dashboard', path: '/', icon: <Home size={16} /> },
    { label: 'My Claims', path: '/claims', icon: <ClipboardList size={16} /> },
    { label: 'New Outpatient Claim', path: '/claims/outpatient', icon: <Pill size={16} /> },
    { label: 'New Inpatient Claim', path: '/claims/inpatient', icon: <ClipboardList size={16} /> },
    { label: 'Chronic Medication', path: '/claims/chronic', icon: <Scale size={16} /> },
    { label: 'Claim History', path: '/claims/history', icon: <FileText size={16} /> },
    { label: 'My Membership', path: '/members', icon: <Users size={16} /> },
  ]

  // Admin menu
  const adminMenu = [
    { label: 'Dashboard', path: '/admin', icon: <Home size={16} /> },
    { label: 'Claims Management', path: '/admin/claims', icon: <ClipboardList size={16} /> },
    { label: 'Reimbursement Scales', path: '/admin/reimbursement-scales', icon: <Scale size={16} /> },
    { label: 'Membership Types', path: '/admin/membership-types', icon: <Users size={16} /> },
    { label: 'Members List', path: '/members', icon: <Users size={16} /> },
    { label: 'Reports', path: '/admin/reports', icon: <FileText size={16} /> },
  ]

  const menu = user.role === 'admin' || user.role === 'committee' ? adminMenu : memberMenu

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col border-r border-gray-200">
      <div className="p-5 text-xl font-semibold text-blue-700 border-b">SGSS Medical Fund</div>

      <nav className="flex-1 overflow-y-auto mt-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-2 px-5 py-2 text-sm rounded-lg mx-2 my-1 transition-all duration-150',
              currentPath === item.path
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t text-xs text-center py-3 text-gray-500">
        {user.role === 'admin' ? 'Admin Panel' : 'Member Portal'}
      </div>
    </aside>
  )
}
