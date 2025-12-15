// Frontend/src/store/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "~/config/api";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  groups: string[];
  is_superuser?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  role?: string;       // "member" | "committee" | "admin"
  groups?: string[];   // lowercased group names
}

interface AuthContextType {
  auth: AuthState;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    groups: [],
  });
  const [loading, setLoading] = useState(true);

  // 🔄 Restore session on first load
  useEffect(() => {
    refreshUser();
  }, []);

  // ✅ Login
  const login = async (username: string, password: string) => {
    try {
      // Always fetch CSRF before POSTing
      await api.get("auth/csrf/");
      await api.post("auth/login/", { username, password });

      await refreshUser();
    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err);
      throw err;
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await api.post("auth/logout/");
      console.log("✅ Logged out successfully");
    } catch (err) {
      console.warn("Logout failed:", err);
    } finally {
      // pull a fresh CSRF token & clear state
      try {
        await api.get("auth/csrf/");
      } catch {console.warn("Failed to refresh CSRF token after logout");}
      setAuth({ isAuthenticated: false, groups: [] });
    }
  };

  // ✅ Refresh current user from backend
  const refreshUser = async () => {
    try {
      const res = await api.get("auth/me/");
      const user: User = res.data;

      const groupsLower = (user.groups || []).map((g: string) => g.toLowerCase());
      const roleLower = (user.role || groupsLower[0] || "member").toLowerCase();

      setAuth({
        isAuthenticated: true,
        user,
        role: roleLower,
        groups: groupsLower,
      });
    } catch {
      setAuth({ isAuthenticated: false, groups: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
