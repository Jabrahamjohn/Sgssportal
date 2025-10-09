// src/components/auth/ProtectedRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children, roles }: { children: JSX.Element; roles: string[] }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="text-center p-10 text-gray-500">Loading...</p>

  if (!user) return <Navigate to="/login" replace />

  if (!roles.includes(user.role)) return <Navigate to="/" replace />

  return children
}
