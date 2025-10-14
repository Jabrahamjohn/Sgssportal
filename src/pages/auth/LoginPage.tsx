// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('✅ Check your email for the magic login link.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      {/* Branded Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">SGSS Medical Fund</h1>
        <p className="text-gray-600 mt-1">Member & Claims Portal</p>
      </header>

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-center mb-6 text-blue-700">
          Member Login
        </h2>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your registered email"
          className="w-full border rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? 'Sending link...' : 'Send Magic Link'}
        </button>
        <button
          onClick={() => {
            localStorage.setItem('dev_user', JSON.stringify({ email: 'test@sgss.com', role: 'admin' }))
            window.location.reload()
          }}
          className="mt-3 text-sm underline text-gray-500"
        >
          Dev Login (bypass magic link)
        </button>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-600">{message}</p>
        )}
      </form>

      <footer className="text-xs text-gray-500 mt-6">
        © {new Date().getFullYear()} Siri Guru Singh Sabha – Medical Fund
      </footer>
    </div>
  )
}
