import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/";
const baseURL = rawUrl.endsWith("/api/") ? rawUrl : (rawUrl.endsWith("/") ? `${rawUrl}api/` : `${rawUrl}/api/`);

export const api = axios.create({
  baseURL,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Debug CSRF issues:
api.interceptors.request.use((config) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];

  config.headers["X-CSRFToken"] = token ?? "";
  return config;
});

// 401 redirect
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      if (!location.pathname.startsWith("/login")) location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
