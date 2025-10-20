import React from 'react'
import { useAuth } from '../hooks/useAuth'

export default function MockUserBanner() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 shadow-lg rounded-2xl px-4 py-2 text-sm text-gray-700 flex items-center space-x-3 z-50">
      <div className="flex flex-col text-right">
        <span className="font-semibold text-gray-800">{user.email}</span>
        <span className="text-xs text-gray-500">Role: {user.role}</span>
      </div>
      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
    </div>
  )
}
