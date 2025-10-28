// Frontend/src/layout/protections/authenticated.tsx
import React from 'react';
import { useAuth } from '~/store/contexts/AuthContext';
import Layout from '../index';
import Dynamic from '../../utils/components/dynamic';
import SplashScreen from '../../utils/components/splash-screen';
import Spin from '~/components/controls/spin';
import { pageRoutes } from '~/config/routes';

const Authenticated = ({
  // children,
  roles,
}: {
  // children: React.ReactNode;
  roles?: string[];
}) => {
  const { auth, loading } = useAuth();

  if (loading) return <Spin fullscreen />;

  if (!auth?.isAuthenticated)
    return (
      <Dynamic
        fallback={<SplashScreen />}
        component={React.lazy(() => import('../../containers/auth/login'))}
      />
    );

  if (roles && !roles.includes(auth.role as string)) {
    window.location.href = pageRoutes.MEMBERS;
    return null;
  }

  return <Layout />;
};

export default Authenticated;
