import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AuthService from '../utils/auth_service';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const location = useLocation();
  const authService = AuthService.getInstance();

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          await authService.whoami();
        } catch (error) {
          // If whoami fails, the axios interceptor will handle the 401 and redirect to login
          console.error('Failed to verify authentication:', error);
        }
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-run on pathname change

  return <>{children}</>;
};

export default AuthProvider; 