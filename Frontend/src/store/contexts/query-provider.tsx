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

function QueryProvider({ children }: { children: React.ReactNode }) {
  const { open } = useAlertContext();
  const { logout, changeCSRFToken } = useAuthContext();
  // const pathname = window.location.pathname;

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
          if (err.status !== 401)
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
          if (err.status !== 401)
            open({
              message: err.message,
              type: 'error',
            });
          if (err.status === 401) logout();
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
  }, [open, logout, changeCSRFToken]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
