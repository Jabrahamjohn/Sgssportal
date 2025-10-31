// Frontend/src/layout/protections/authenticated.tsx
import React, { useEffect } from "react";
import { useAuth } from "~/store/contexts/AuthContext";
import Layout from "../index";
import Dynamic from "~/utils/components/dynamic";
import SplashScreen from "~/utils/components/splash-screen";
import Spin from "~/components/controls/spin";

interface Props {
  children: React.ReactNode;
  allowed?: string[];
}

const Authenticated: React.FC<Props> = ({ children, allowed }) => {
  const { auth, loading } = useAuth();

  // 🧠 Only persist user once we actually have one
  useEffect(() => {
    if (auth?.user && auth?.isAuthenticated) {
      localStorage.setItem("user", JSON.stringify(auth.user));
    }
  }, [auth.user, auth.isAuthenticated]);

  // ⏳ Show spinner while restoring session
  if (loading) return <Spin fullscreen />;

  // ❌ If not logged in → just render Login (no window.location.href)
  if (!auth?.isAuthenticated) {
    return (
      <Dynamic
        fallback={<SplashScreen />}
        component={React.lazy(() => import("~/containers/auth/login"))}
      />
    );
  }

  // 🔒 If role isn’t allowed, stay in-app instead of redirecting
  if (allowed && !allowed.includes(auth.role || "member")) {
    return (
      <Layout>
        <div className="p-6 text-center text-gray-500">
          You don’t have access to this section.
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
};

export default Authenticated;
