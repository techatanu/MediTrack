// The only module that touches localStorage. Stores the JWT and the first name shown
// in the UI — nothing else from the user's profile.
const TOKEN_KEY = "token";
const FIRST_NAME_KEY = "firstName";
const LEGACY_KEYS = ["username"];

// Storage can throw (private mode, blocked site data); treat that as "no session".
const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Session just won't survive a reload.
  }
};

export const getToken = () => read(TOKEN_KEY);

export const loadSession = () => {
  const token = read(TOKEN_KEY);
  return token ? { token, firstName: read(FIRST_NAME_KEY) || "" } : null;
};

export const saveSession = ({ token, firstName }) => {
  write(TOKEN_KEY, token);
  write(FIRST_NAME_KEY, firstName);
};

export const clearSession = () => {
  [TOKEN_KEY, FIRST_NAME_KEY, ...LEGACY_KEYS].forEach((key) => write(key, null));
};
