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
  role?: string;
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
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch user on startup to restore session
  useEffect(() => {
    refreshUser();
  }, []);

  // 🔹 Login
  const login = async (username: string, password: string) => {
  try {
    // ✅ always get CSRF token before POST
    await api.get("auth/csrf/");
    await api.post("auth/login/", { username, password });
    await refreshUser();
  } catch (err: any) {
    console.error("Login failed:", err.response?.data || err);
    throw err;
  }
};


  // 🔹 Logout
  const logout = async () => {
  try {
    await api.post("auth/logout/");  // backend sends Set-Cookie header
    console.log("✅ Logged out successfully");
  } catch (err) {
    console.warn("Logout failed:", err);
  } finally {
    // Pull the new CSRF token immediately, guaranteeing sync
    await api.get("auth/csrf/");
    setAuth({ isAuthenticated: false });
  }
};



  // 🔹 Refresh user (called after login and on mount)
  const refreshUser = async () => {
    try {
      const res = await api.get("auth/me/");
      const user = res.data;
      setAuth({
        isAuthenticated: true,
        user,
        role: user.role || "member",
      });
    } catch {
      setAuth({ isAuthenticated: false });
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
