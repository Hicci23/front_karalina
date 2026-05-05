import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, setUser, clear } = useAuthStore();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) return;
    authApi
      .me()
      .then(setUser)
      .catch(clear)
      .finally(() => setChecking(false));
  }, [clear, isAuthenticated, setUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clear();
    };

    window.addEventListener('mapapp:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('mapapp:unauthorized', handleUnauthorized);
  }, [clear]);

  if (checking) {
    return <div className="app-loader">Клокет загружается...</div>;
  }

  if (!useAuthStore.getState().isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
