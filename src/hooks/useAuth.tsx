// src/hooks/useAuth.ts
import { useContext, createContext, useState } from 'react'

type Role = 'admin' | 'member' | 'claims_officer' | 'approver'

interface MockUser {
  id: string
  email: string
  role: Role
}

interface AuthContextType {
  user: MockUser
  setRole: (role: Role) => void
}

const mockUser: MockUser = {
  id: '0000-1111-2222-3333',
  email: 'admin@sgss.org',
  role: 'admin',
}

const AuthContext = createContext<AuthContextType>({
  user: mockUser,
  setRole: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MockUser>(mockUser)

  const setRole = (role: Role) => setUser({ ...user, role })

  return (
    <AuthContext.Provider value={{ user, setRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
