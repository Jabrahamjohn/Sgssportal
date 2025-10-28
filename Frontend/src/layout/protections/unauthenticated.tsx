import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { pageRoutes } from '~/config/routes';

export default function Unauthenticated({
  children,
}: {
  children: React.ReactElement;
}) {
  const { auth, loading } = useAuth();
  const { user } = auth;

  if (loading) return <div className='p-8'>Loading…</div>;
  if (user) {
    const path =
      user.role === 'admin'
        ? pageRoutes.ADMIN
        : user.role === 'committee'
        ? pageRoutes.COMMITTE
        : pageRoutes.MEMBERS;
    return <Navigate to={path} replace />;
  }
  return children;
}
