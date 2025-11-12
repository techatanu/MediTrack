
import axios from "axios";


export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});


api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});


export const getErrorMessage = (err, fallback = "Request failed") =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  fallback;


export const signup = (name, email, password) =>
  api.post("/auth/signup", { name, email, password });

export const login = (email, password) =>
  api.post("/auth/login", { email, password });


export const registerUser = async (userData) => {
  const res = await api.post("/signup", userData);
  return res.data;
};

export default api;