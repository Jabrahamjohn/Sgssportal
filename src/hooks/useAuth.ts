import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    // Provide safe defaults so destructuring never fails
    return { user: null, signIn: () => {}, signOut: () => {} }
  }
  return context
}
