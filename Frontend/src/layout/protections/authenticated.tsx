// Frontend/src/layout/protections/authenticated.tsx
import React, { useEffect } from "react";
import { useAuth } from "~/store/contexts/AuthContext";
import Dynamic from "~/utils/components/dynamic";
import SplashScreen from "~/utils/components/splash-screen";
import Spin from "~/components/controls/spin";

interface Props {
  children: React.ReactNode;
  allowed?: string[];
}

const Authenticated: React.FC<Props> = ({ children, allowed }) => {
  const { auth, loading } = useAuth();

  // 🧠 Persist user in localStorage
  useEffect(() => {
    if (auth?.user && auth?.isAuthenticated) {
      localStorage.setItem("user", JSON.stringify(auth.user));
    }
  }, [auth.user, auth.isAuthenticated]);

  // ⏳ Show spinner while restoring session
  if (loading) return <Spin fullscreen />;

  // ❌ Not logged in → render Login dynamically
  if (!auth?.isAuthenticated) {
    return (
      <Dynamic
        fallback={<SplashScreen />}
        component={React.lazy(() => import("~/containers/auth/login"))}
      />
    );
  }

  // 🔒 Access denied → show simple notice
  if (allowed && !allowed.includes(auth.role || "member")) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        You don’t have access to this section.
      </div>
    );
  }

  // ✅ Just render children (no extra layout wrapper)
  return <>{children}</>;
};

export default Authenticated;
