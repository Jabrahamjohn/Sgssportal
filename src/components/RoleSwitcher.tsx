import React from 'react'
import { useAuth } from '../hooks/useAuth'

export default function RoleSwitcher() {
  const { user, setRole } = useAuth()

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-xl p-3 border border-gray-200">
      <span className="text-sm text-gray-700 font-medium">Role:</span>
      <select
        value={user.role}
        onChange={(e) => setRole(e.target.value as any)}
        className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="admin">Admin</option>
        <option value="member">Member</option>
        <option value="claims_officer">Claims Officer</option>
        <option value="approver">Approver</option>
      </select>
    </div>
  )
}
