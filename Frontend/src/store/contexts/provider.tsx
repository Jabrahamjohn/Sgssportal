import React from 'react';

import AlertProvider from './alert/provider';
import AuthProvider from './auth/provider';

import QueryProvider from './query-provider';

function Provider({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <AuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </AuthProvider>
    </AlertProvider>
  );
}

export default Provider;
