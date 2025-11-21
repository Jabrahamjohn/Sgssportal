// Frontend/src/layout/protections/authenticated.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "~/store/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  allowed?: string[]; // e.g. ["member", "committee", "admin"]
}

export default function Authenticated({ children, allowed }: Props) {
  const { auth, loading } = useAuth();

  if (loading) return <div className="p-6">Loading…</div>;

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const groups = auth.groups || [];
  const isSuper = auth.user?.is_superuser;

  // If no allowed roles specified → any logged-in user is allowed
  if (!allowed || allowed.length === 0) {
    return <>{children}</>;
  }

  const allowedLower = allowed.map((r) => r.toLowerCase());

  const hasAccess =
    !!isSuper ||
    groups.some((g) => allowedLower.includes(g.toLowerCase()));

  if (!hasAccess) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold text-red-600">
          You don’t have access to this section.
        </h2>
        <p className="mt-2 text-gray-700">
          Required role: {allowed.join(", ")}
          <br />
          Your roles: {groups.join(", ") || "none"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
