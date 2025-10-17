// src/hooks/useAuth.tsx
import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"
import { useNavigate } from "react-router-dom"

interface AuthContextProps {
  user: any
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      // ✅ Restore session on page load
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        await loadProfile(session.user.id)
        redirectByRole(session.user.id)
      } else {
        setLoading(false)
      }

      // ✅ Listen for auth changes (magic link callback)
      const { data: subscription } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await loadProfile(session.user.id)
            redirectByRole(session.user.id)
          } else {
            setUser(null)
          }
          setLoading(false)
        }
      )

      return () => subscription.subscription.unsubscribe()
    }

    const loadProfile = async (userId: string) => {
      try {
        const { data: profile } = await supabase
          .from("users")
          .select("id, email, full_name, role")
          .eq("id", userId)
          .single()

        setUser(profile || { id: userId, role: "member" })
      } catch (e) {
        console.error("Error loading profile:", e)
      } finally {
        setLoading(false)
      }
    }

    const redirectByRole = async (userId: string) => {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single()

      if (!profile?.role) return navigate("/dashboard")

      switch (profile.role) {
        case "admin":
          navigate("/admin")
          break
        case "committee":
          navigate("/committee")
          break
        default:
          navigate("/dashboard")
      }
    }

    init()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}