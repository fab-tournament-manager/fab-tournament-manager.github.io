import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactElement;
  roles?: UserRole[];
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="center-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && profile?.role && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
