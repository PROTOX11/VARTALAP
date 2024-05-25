import React from 'react';
import { Navigate } from 'react-router-dom';

const CustomRouteGuard = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // Check authentication status

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default CustomRouteGuard;
