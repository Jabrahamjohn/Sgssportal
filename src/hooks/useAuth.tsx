// src/hooks/useAuth.tsx
import React, { createContext, useEffect, useState, useContext } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext<any>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const setupAuth = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role_id, email')
          .eq('id', session.user.id)
          .single()

        const { data: role } = await supabase.from('roles').select('name').eq('id', profile.role_id).single()
        setUser({ id: session.user.id, email: profile.email, role: role?.name || 'member' })
      }
      setLoading(false)
    }

    setupAuth()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
