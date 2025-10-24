// Frontend/src/App.tsx
import React from "react";
import { AuthProvider } from "./store/contexts/AuthContext";
import { ErrorBoundary } from "./components/common";
import AppRouter from "./router";

import "./styles/index.css";
import "./styles/antd-override.css";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}
