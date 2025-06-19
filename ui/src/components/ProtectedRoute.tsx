import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../utils/auth_service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const authService = AuthService.getInstance();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user info
        await authService.whoami();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Protected route auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show nothing while checking auth
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    // Store the attempted URL for redirect after login
    if (location.pathname !== '/dashboard') {
      localStorage.setItem('redirectAfterLogin', location.pathname);
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 