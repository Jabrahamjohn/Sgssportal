
import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "~/config/api";
import {
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
     if (!uid || !token) {
         setStatus("error");
         setMessage("Invalid password reset link. Please check your email and try again.");
     }
  }, [uid, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !uid || !token) return;
    
    if (password.length < 8) {
        setMessage("Password must be at least 8 characters.");
        setStatus("error");
        return;
    }

    if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        setStatus("error");
        return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      await api.post("/auth/password_reset/confirm/", { 
          uid, 
          token, 
          password 
      });
      setStatus("success");
      setMessage("Your password has been successfully reset.");
      
      // Auto-redirect after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      if (err.response?.data?.errors) {
         // Django returns detailed errors object
         const details = Object.values(err.response.data.errors).flat().join(" ");
         setMessage(details || "Could not reset password.");
      } else {
         setMessage(err.response?.data?.detail || "Link invalid or expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "error" && !uid) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
             <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                 <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4"/>
                 <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
                 <p className="text-gray-600 mb-6">{message}</p>
                 <Link to="/forgot-password" className="text-blue-600 font-medium hover:underline">
                    Request a new link
                 </Link>
             </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Set New Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === "success" ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Password Reset!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{message}</p>
                  </div>
                  <p className="mt-4 text-sm text-green-600">Redirecting to login...</p>
                  <div className="mt-2">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-green-800 hover:text-green-900 underline"
                    >
                      Click here if not redirected &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {status === "error" && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-slate-300 pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2"
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                            <EyeIcon className="h-5 w-5" />
                        )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border-slate-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2"
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Set New Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
