import React, { createContext, useContext, useState, useEffect } from "react";
import api from "~/config/api";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  groups: string[];
  full_name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  role?: string;
}

interface AuthContextType {
  auth: AuthState;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  // 1️⃣ Fetch user on startup
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me/");
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
    fetchUser();
  }, []);

  // 2️⃣ Login function
  const login = async (email: string, password: string) => {
    try {
      await api.post("/auth/login/", { email, password });
      await refreshUser();
    } catch (err: any) {
      console.error("Login failed", err.response?.data || err);
      throw err;
    }
  };

  // 3️⃣ Logout function
  const logout = async () => {
    try {
      await api.post("/auth/logout/");
    } catch {
      /* ignore */
    } finally {
      setAuth({ isAuthenticated: false });
    }
  };

  // 4️⃣ Refresh user from backend
  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me/");
      const user = res.data;
      setAuth({
        isAuthenticated: true,
        user,
        role: user.role || "member",
      });
    } catch {
      setAuth({ isAuthenticated: false });
    }
  };

  return (
    <AuthContext.Provider value={{ auth, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy use
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
