// src/components/layout/Header.tsx
import React from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white border-b p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">SGSS Medical Fund Portal</h1>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-gray-600">
              {user.full_name || user.email}
            </span>
            <button
              onClick={signOut}
              className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  )
}
