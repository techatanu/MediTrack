import axios from "axios";
import { getToken } from "./session";

// Must match the backend's default PORT (5050). Production builds read .env.production.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5050/api";

// No default Content-Type: axios picks JSON for objects and multipart for FormData.
// (Forcing application/json would make axios serialise FormData uploads as JSON.)
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Registered by AuthProvider: logs out and redirects when the session is rejected.
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// On these endpoints a 401 means "wrong credentials", not "session expired".
const CREDENTIAL_ENDPOINTS = ["/users/login", "/users/signup"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !CREDENTIAL_ENDPOINTS.includes(error.config?.url)) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

// User-facing message for a failed request: the first field-level validation message,
// else the backend's error message, else a fallback.
export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (!err?.response) return "Network error. Please check your connection and try again.";
  const body = err.response.data;
  return body?.error?.details?.[0]?.message || body?.error?.message || fallback;
};

export default api;
