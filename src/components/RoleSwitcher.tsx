import React from 'react'
import { useAuth } from '../hooks/useAuth'

export default function RoleSwitcher() {
  const auth = useAuth()

  // ⛑️ Guard: if context not ready or user not loaded yet
  if (!auth || !auth.user) return null

  const { user, setRole } = auth

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value)
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg border rounded-lg p-3 text-sm">
      <p className="font-medium text-gray-700">Switch Role</p>
      <select
        value={user.role}
        onChange={handleChange}
        className="mt-1 border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
        <option value="committee">Committee</option>
      </select>
    </div>
  )
}
