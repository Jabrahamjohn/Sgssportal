import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "~/store/contexts/AuthContext";
import Spin from "~/components/controls/spin";

export default function Unauthenticated({ children }: { children: React.ReactNode }) {
  const { auth, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && auth.isAuthenticated) {
      const role = auth.role || "member";
      if (role === "admin") navigate("/dashboard/admin");
      else if (role === "committee") navigate("/dashboard/committee");
      else navigate("/dashboard/member");
    }
  }, [auth.isAuthenticated, auth.role, loading, navigate]);

  if (loading) return <Spin fullscreen />;

  // Only render the page if not authenticated
  if (!auth.isAuthenticated) return <>{children}</>;

  // Prevent flicker while redirecting
  return <Spin fullscreen />;
}
