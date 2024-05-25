import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // Check authentication status

  return isAuthenticated ? <Navigate to="/logged" /> : children;
};

export default AuthGuard;
