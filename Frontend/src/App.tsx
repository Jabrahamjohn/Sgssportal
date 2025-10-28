// Frontend/src/App.tsx
import { AuthProvider } from './store/contexts/AuthContext';
import { ErrorBoundary } from './components/common';
import AppRouter from './router';

import './styles/index.css';
import './styles/antd-override.css';
import { AlertProvider } from './store/contexts';

export default function App() {
  return (
    <ErrorBoundary>
      <AlertProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </AlertProvider>
    </ErrorBoundary>
  );
}
