// Frontend/src/App.tsx
import React, { useEffect } from "react";
import { AuthProvider } from "./store/contexts/AuthContext";
import { ErrorBoundary } from "./components/common";
import AppRouter from "./router";
import api from "./config/api";

import "./styles/theme.css";
import "./styles/index.css";
import "./styles/antd-override.css";

export default function App() {
  useEffect(() => {
    api.get("/auth/csrf/").catch(console.error);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}
