// src/hooks/useAuth.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

interface AuthContextProps {
  user: any
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      // 1️⃣ Get active session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setLoading(false)
      }

      // 2️⃣ Subscribe to auth state changes (for magic link logins)
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      })

      return () => listener.subscription.unsubscribe()
    }

    const loadProfile = async (userId: string) => {
      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('id, email, full_name, role')
          .eq('id', userId)
          .single()

        if (error && error.code !== 'PGRST116') console.error(error)

        setUser(profile || { id: userId, role: 'member' })
      } catch (e) {
        console.error('Error loading profile:', e)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
// End of useAuth.tsx