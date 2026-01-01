import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/";
const baseURL = rawUrl.endsWith("/api/") ? rawUrl : (rawUrl.endsWith("/") ? `${rawUrl}api/` : `${rawUrl}/api/`);

export const api = axios.create({
  baseURL,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Local storage for CSRF token (since cookie is HttpOnly or cross-domain issues prevent access)
let csrfToken: string | null = null;

export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

// Debug CSRF issues:
api.interceptors.request.use((config) => {
  // 1. Try local variable (populated by App.tsx)
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
    return config;
  }

  // 2. Fallback to cookie (for development / same-domain)
  const tokenFromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];

  config.headers["X-CSRFToken"] = tokenFromCookie ?? "";
  return config;
});

// Response interceptor to capture token if returned in body or header
api.interceptors.response.use(
  (response) => {
    // If backend returns csrfToken in body (e.g. login or csrf endpoint)
    if (response.data && response.data.csrfToken) {
       setCsrfToken(response.data.csrfToken);
    }
    return response;
  },
  (err) => {
    if (err?.response?.status === 401) {
      if (!location.pathname.startsWith("/login")) location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
