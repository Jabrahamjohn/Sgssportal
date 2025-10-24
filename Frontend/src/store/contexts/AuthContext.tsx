import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Auth from '../../server/services/auth.service';
import type { UserSession } from '../../types/auth';

type AuthState = {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  async function bootstrap() {
    try {
      const me = await Auth.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    await Auth.login(email, password);
    const me = await Auth.me();
    setUser(me);
  };

  const logout = async () => {
    await Auth.logout();
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
