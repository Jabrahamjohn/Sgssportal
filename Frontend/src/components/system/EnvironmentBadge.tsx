import React from 'react'

export default function EnvironmentBadge() {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  const isLocal = url.includes('127.0.0.1') || url.includes('localhost')

  const label = isLocal ? '💻 Local Dev' : '🌐 Cloud'
  const color = isLocal ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'

  return (
    <div
      className={`fixed bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${color}`}
    >
      {label}
    </div>
  )
}
