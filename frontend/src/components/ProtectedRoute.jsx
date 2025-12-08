import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Direct check for speed and robustness
  // This prevents "flicker" of the protected content or waiting for context
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token found, redirect to login immediately
    return <Navigate to="/login" replace />;
  }

  // If token exists, allow rendering the protected page
  // The page itself (e.g., Dashboard) might still do an API call 
  // and find the token invalid, at which point it should handle logout (401 error)
  return children;
};

export default ProtectedRoute;