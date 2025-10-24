import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';

export default function Unauthenticated({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading…</div>;
  if (user) {
    const path =
      user.role === 'admin'
        ? '/dashboard/admin'
        : user.role === 'committee'
        ? '/dashboard/committee'
        : '/dashboard/member';
    return <Navigate to={path} replace />;
  }
  return children;
}
