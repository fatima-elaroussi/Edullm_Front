// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children }) => {
  if (!user || !user.profile_id || !user.user_id) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;