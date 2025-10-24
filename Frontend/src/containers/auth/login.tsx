import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "~/store/contexts/AuthContext";
import { Button, Input, Alert, Spin } from "~/components/controls";
import { APP_NAME, LOGO_IMAGE } from "~/config";
import { AppImage } from "~/components/controls";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard/member", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        "Invalid email or password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert type="error" message={error} />}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email or Username
            </label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg"
          >
            {loading ? <Spin size="small" /> : "Sign In"}
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
};

export default Login;
