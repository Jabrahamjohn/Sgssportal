import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, Alert, Spin, AppImage } from "~/components/controls";
import { APP_NAME, LOGO_IMAGE } from "~/config";
import api from "~/config/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/auth/csrf/").catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register/", form);
      setSuccess(res.data.detail || "Registration successful!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed.");
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <h2 className="text-2xl font-semibold text-center mb-2">Register</h2>

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <Input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <Input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
          <Input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} />
          <Input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} />
          <Input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />

          <Button type="submit" block disabled={loading}>
            {loading ? <Spin size="small" /> : "Register"}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
