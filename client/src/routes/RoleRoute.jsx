import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useRole } from '../hooks/useRole.js';
import { ROUTES } from '../constants/routes.js';

export function RoleRoute({ allowedRoles }) {
  const role = useRole();
  return allowedRoles.includes(role) ? <Outlet /> : <Navigate to={ROUTES.UNAUTHORIZED} replace />;
}
