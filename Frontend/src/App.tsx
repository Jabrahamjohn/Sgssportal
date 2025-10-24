import React from 'react';
import Router from './router';
import { AuthProvider } from './store/contexts/AuthContext';
import './styles/index.css';
import './styles/antd-override.css';

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
