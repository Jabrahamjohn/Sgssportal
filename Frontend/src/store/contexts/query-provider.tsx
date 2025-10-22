import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import React from 'react';

import { CSRF_TOKEN } from '~/config/app';
import { useAuthContext } from './auth/context';
import { useAlertContext } from './alert/context';
import { handleAllErrors } from '../../utils/errors';
import { external_routes } from '~/config/routes';

function QueryProvider({ children }: { children: React.ReactNode }) {
  const { open } = useAlertContext();
  const { logout, changeCSRFToken } = useAuthContext();
  const pathname = window.location.pathname;
  // console.log(external_routes[0] === pathname);

  // Create a client
  const queryClient = React.useMemo(() => {
    const client = new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => {
          if (
            error instanceof AxiosError &&
            error.response &&
            typeof error.response.headers.get === 'function'
          ) {
            const csrfToken = error.response.headers
              .get(CSRF_TOKEN)
              ?.toString();
            if (csrfToken) changeCSRFToken(csrfToken);
          }
          const err = handleAllErrors(error);
          if (err.status !== 401 && !external_routes.includes(pathname))
            open({
              message: err.message,
              type: 'error',
            });
          if (err.status === 401) logout();
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          if (
            error instanceof AxiosError &&
            error.response &&
            typeof error.response.headers.get === 'function'
          ) {
            const csrfToken = error.response.headers
              .get(CSRF_TOKEN)
              ?.toString();
            if (csrfToken) changeCSRFToken(csrfToken);
          }
          const err = handleAllErrors(error);
          if (err.status !== 401 && !external_routes.includes(pathname))
            open({
              message: err.message,
              type: 'error',
            });
          if (err.status === 401 && !external_routes.includes(pathname))
            logout();
        },
      }),
      defaultOptions: {
        queries: {
          refetchOnMount: true,
          // refetchOnReconnect: false,
          refetchOnWindowFocus: false,
        },
      },
    });
    return client;
  }, [open, logout, changeCSRFToken, pathname]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
