import { Navigate } from 'react-router-dom';

import { DASHBOARD_PAGE } from '~/config/routes';
import { useAuthContext } from '~/store/contexts/auth';

export default function NotAuthenticated({ children }: { children: React.ReactNode }) {
  const { auth: isAuthenticated, loading: isLoading } = useAuthContext();

  if (isLoading === false && isAuthenticated === false) return children;

  if (isLoading === false && isAuthenticated) return <Navigate to={DASHBOARD_PAGE} />;

  throw {
    title: 'Internal Server Error.',
    status: 500,
    message: 'An error occurred. Please try again later.',
  };
}
