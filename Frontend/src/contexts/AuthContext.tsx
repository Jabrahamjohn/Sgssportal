// src/contexts/AuthContext.tsx
import React, { createContext, useEffect, useState, useContext } from 'react'
import { User } from '../types'
import { supabase } from '../services/supabaseClient'

// Define the shape of our Auth context
interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

// Create the context with default non-null shape
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          role: 'member',
        })
      }
      setLoading(false)
    })

    // Subscribe to auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          role: 'member',
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Cleanup
    return () => {
      subscription?.subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Optional: built-in useAuth helper to avoid repeating useContext
export const useAuth = () => useContext(AuthContext)
