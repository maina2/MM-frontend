// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  allowedRoles: ('customer' | 'admin' | 'delivery')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const user = useSelector((state: RootState) => state.auth.user);

  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    role,
    user,
    allowedRoles,
  });

  if (!isAuthenticated) {
    console.log('Redirecting to /login: Not authenticated');
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    console.log('Waiting for user data');
    return <div>Loading...</div>;
  }

  if (!role || !allowedRoles.includes(role)) {
    console.log('Redirecting to /unauthorized: Invalid role or no role', { role, allowedRoles });
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;