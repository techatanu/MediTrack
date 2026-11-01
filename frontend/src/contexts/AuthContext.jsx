import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUnauthorizedHandler } from '../utils/api';
import { clearSession, loadSession, saveSession } from '../utils/session';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Read synchronously so protected routes don't redirect before the session loads.
  const [session, setSession] = useState(loadSession);
  const navigate = useNavigate();

  // Takes the { user, token } returned by authService.login / signup.
  const login = useCallback(({ user, token }) => {
    const next = { token, firstName: user?.firstName || '' };
    saveSession(next);
    setSession(next);
  }, []);

  // Partial update: { token } after a password change (old tokens are revoked),
  // { firstName } after a profile edit.
  const updateSession = useCallback((changes) => {
    setSession((prev) => {
      const next = { ...prev, ...changes };
      saveSession(next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate('/login', { replace: true });
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, navigate]);

  const value = useMemo(() => ({
    user: session ? { firstName: session.firstName } : null,
    isAuthenticated: Boolean(session),
    login,
    updateSession,
    logout
  }), [session, login, updateSession, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
