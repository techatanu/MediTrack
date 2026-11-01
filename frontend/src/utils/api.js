import axios from "axios";

// Must match the backend's default PORT (5050). Production builds read .env.production.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5050/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Message from a backend error body: first field-level validation message, else the error message.
export const apiErrorMessage = (body, fallback = "Request failed") =>
  body?.error?.details?.[0]?.message || body?.error?.message || fallback;

export default api;
