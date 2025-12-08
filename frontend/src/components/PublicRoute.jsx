import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');

    if (token) {
        // If logged in, don't show Login/Signup, redirect to Dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // If not logged in, allow access to public page
    return children;
};

export default PublicRoute;
