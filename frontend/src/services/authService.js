import api from "../utils/api";

// Each function resolves to the response's `data` payload and rejects with the axios
// error; use getErrorMessage() from utils/api for display.

/** @returns {Promise<{ user: object, token: string }>} */
export const signup = async ({ firstName, lastName, email, password }) =>
  (await api.post("/users/signup", { firstName, lastName, email, password })).data.data;

/** @returns {Promise<{ user: object, token: string }>} */
export const login = async (email, password) =>
  (await api.post("/users/login", { email, password })).data.data;

export const getProfile = async () => (await api.get("/users/profile")).data.data;

export const updateProfile = async (fields) => (await api.put("/users/profile", fields)).data.data;

/** @returns {Promise<{ token: string }>} a new token; all older tokens are revoked. */
export const changePassword = async (currentPassword, newPassword) =>
  (await api.put("/users/profile/password", { currentPassword, newPassword })).data.data;
