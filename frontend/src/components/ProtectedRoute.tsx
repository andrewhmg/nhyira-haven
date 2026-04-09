import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border" style={{ color: 'var(--nh-primary)' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect donors away from admin pages
  if (user?.role === 'Donor' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/donor" replace />;
  }

  // Redirect admin/staff away from donor portal
  if (user?.role !== 'Donor' && location.pathname.startsWith('/donor')) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
