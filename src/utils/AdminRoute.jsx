import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children, user }) => {
  // Check if user exists and has admin privileges (profile_id 3 for admin)
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.profile_id !== 1) {
    return <Navigate to="/app" replace />;
  }
  
  return children;
};

export default AdminRoute;