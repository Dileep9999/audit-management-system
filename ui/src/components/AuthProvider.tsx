import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../utils/auth_service';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authService = AuthService.getInstance();
  const [isChecking, setIsChecking] = useState(true);
  const [lastPath, setLastPath] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      // Skip auth check if we're in the process of redirecting after login
      if (localStorage.getItem('isRedirecting') === 'true') {
        console.log('Skipping auth check - redirect in progress');
        localStorage.removeItem('isRedirecting');
        if (isMounted) {
          setIsChecking(false);
        }
        return;
      }

      // Skip auth check if we're already on the target path
      if (lastPath === location.pathname) {
        console.log('Already on target path, skipping auth check');
        if (isMounted) {
          setIsChecking(false);
        }
        return;
      }

      console.log('Checking auth status for path:', location.pathname);
      try {
        // Check if we have a valid session
        const isAuthenticated = authService.isAuthenticated();
        console.log('Auth status check:', { isAuthenticated, path: location.pathname });

        if (isAuthenticated) {
          // If we're on the login page but authenticated, redirect to dashboard
          if (location.pathname === '/login') {
            console.log('Authenticated on login page, redirecting to dashboard');
            const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboards/ecommerce';
            localStorage.removeItem('redirectAfterLogin');
            if (isMounted) {
              setLastPath(redirectPath);
              navigate(redirectPath, { replace: true });
            }
          }
        } else {
          // Not authenticated, redirect to login if not already there
          if (!location.pathname.includes('/login')) {
            console.log('Not authenticated, redirecting to login');
            if (location.pathname !== '/dashboards/ecommerce') {
              localStorage.setItem('redirectAfterLogin', location.pathname);
            }
            if (isMounted) {
              setLastPath('/login');
              navigate('/login', { replace: true });
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Only redirect to login if we're not already there and not in the process of logging in
        if (!location.pathname.includes('/login')) {
          console.log('Auth check failed, redirecting to login');
          if (location.pathname !== '/dashboards/ecommerce') {
            localStorage.setItem('redirectAfterLogin', location.pathname);
          }
          if (isMounted) {
            setLastPath('/login');
            navigate('/login', { replace: true });
          }
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate, lastPath]);

  // Show nothing while checking initial auth state
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProvider; 