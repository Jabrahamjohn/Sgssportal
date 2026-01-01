// Frontend/src/containers/auth/login.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "~/store/contexts/AuthContext";
import { Button, Input, Alert, Spin, AppImage } from "~/components/controls";
import { APP_NAME, LOGO_IMAGE } from "~/config";
import api from "~/config/api";

export default function Login() {
  const { login, auth, loading } = useAuth();
  const navigate = useNavigate();

  // 1️⃣ Fetch CSRF cookie on mount (required for Django session login)
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        await api.get("/auth/csrf/");
        console.log("✅ CSRF cookie set successfully");
      } catch (err) {
        console.error("❌ Failed to get CSRF cookie", err);
      }
    };
    getCsrfToken();
  }, []);

  // 2️⃣ Auto-redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      const role = auth.role || "member";
      if (role === "admin") navigate("/dashboard/admin");
      else if (role === "committee") navigate("/dashboard/committee");
      else navigate("/dashboard/member");
    }
  }, [auth.isAuthenticated, auth.role, navigate]);

  // 3️⃣ Local state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 4️⃣ Handle login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);

      // refresh session and user data
      await new Promise((r) => setTimeout(r, 500)); // sm delay to ensure context updates
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      const role =
        storedUser?.role ||
        storedUser?.groups?.[0] ||
        auth?.role ||
        auth?.user?.groups?.[0] ||
        "member";

      if (role === "admin") navigate("/dashboard/admin");
      else if (role === "committee") navigate("/dashboard/committee");
      else navigate("/dashboard/member");
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Invalid username or password.";
      setError(message);
    }
  };

  // 5️⃣ UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <AppImage
            src={LOGO_IMAGE}
            alt={APP_NAME}
            className="w-24 h-24 object-contain mb-2"
          />
          <h1 className="text-xl font-bold text-gray-800">
            {APP_NAME || "SGSS Medical Fund"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Member Login
          </h2>

          {error && <Alert type="error" message={error} />}

          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end mb-4">
            <a
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </a>
          </div>

          <Button
            type="submit"
            block
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading}
            onClick={() => console.log("Login clicked")} // 🔹 Debug check
          >
            {loading ? <Spin size="small" /> : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Having trouble logging in? Contact{" "}
          <a
            href="mailto:support@sgssmedicalfund.org"
            className="text-primary-600 hover:underline"
          >
            support@sgssmedicalfund.org
          </a>
        </p>
      </div>
    </div>
  );
}
