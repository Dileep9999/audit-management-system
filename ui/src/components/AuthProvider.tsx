import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../utils/auth_service';
import LanguageSyncService from '../utils/language_sync_service';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authService = AuthService.getInstance();
  const [isChecking, setIsChecking] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasMadeApiCall = useRef(false);
  const apiCallInProgress = useRef(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      // Skip auth check if we're in the process of redirecting
      if (isRedirecting) {
        console.log('Skipping auth check - redirect in progress');
        return;
      }

      // Skip auth check if we've already checked for this path
      if (hasCheckedAuth && location.pathname !== '/login') {
        console.log('Already checked auth for this path, skipping');
        if (isMounted) {
          setIsChecking(false);
        }
        return;
      }

      // Skip auth check if we're already checking
      if (isChecking && hasCheckedAuth) {
        console.log('Auth check already in progress, skipping');
        return;
      }

      console.log('Checking auth status for path:', location.pathname);
      
      // Prevent multiple API calls
      if (hasMadeApiCall.current || apiCallInProgress.current) {
        console.log('API call already made or in progress, skipping');
        if (isMounted) {
          setIsChecking(false);
        }
        return;
      }
      
      apiCallInProgress.current = true;
      
      // Mark that we've checked auth for this session
      setHasCheckedAuth(true);
      
      try {
        // First check if we have a valid session
        const isAuthenticated = authService.isAuthenticated();
        const wasLoggedIn = localStorage.getItem('wasLoggedIn') === 'true';
        console.log('Session check:', { isAuthenticated, wasLoggedIn });

        if (isAuthenticated || wasLoggedIn) {
          try {
            // Try to get user info to validate the session
            await authService.whoami();
            console.log('Session is valid');

            // Sync language from Django session after successful authentication
            // Enhanced sync for login page language changes
            const languageSyncService = LanguageSyncService.getInstance();
            const lastSync = localStorage.getItem('lastLanguageSync');
            const now = Date.now();
            const referrer = document.referrer;
            const isFromLoginPage = referrer.includes('/login') || 
                                  referrer.includes('localhost:8000/login') ||
                                  referrer.includes('localhost:8001/login') ||
                                  referrer.includes('localhost:8002/login') ||
                                  referrer.includes('localhost:8003/login');
            
            console.log('AuthProvider language sync check:', {
              referrer,
              isFromLoginPage,
              lastSync,
              timeSinceLastSync: lastSync ? now - parseInt(lastSync) : 'never'
            });
            
            // Set login time for fresh login detection
            localStorage.setItem('lastLoginTime', now.toString());
            
            // Only sync if coming from login page or if it's been more than 10 seconds
            if (isFromLoginPage || !lastSync || (now - parseInt(lastSync)) > 10000) {
              localStorage.setItem('lastLanguageSync', now.toString());
              
              if (isFromLoginPage) {
                console.log('Syncing language after login page navigation...');
                // Use the enhanced post-login sync method
                languageSyncService.syncAfterLogin();
              } else {
                // Regular sync for other cases (less frequent)
                setTimeout(() => {
                  languageSyncService.syncFromDjangoSession();
                }, 500);
              }
            } else {
              console.log('Skipping language sync - too recent');
            }

            // If we're on the login page but authenticated, redirect to dashboard
            if (location.pathname === '/login') {
              console.log('Authenticated on login page, redirecting to dashboard');
              const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboard';
              localStorage.removeItem('redirectAfterLogin');
              
              if (isMounted) {
                setIsRedirecting(true);
                setHasCheckedAuth(true);
                navigate(redirectPath, { replace: true });
                // Reset redirecting flag after navigation
                setTimeout(() => {
                  if (isMounted) {
                    setIsRedirecting(false);
                  }
                }, 1000);
              }
            }
          } catch (error) {
            console.error('Failed to validate session:', error);
            // Only clear auth and redirect if we weren't previously logged in
            if (!wasLoggedIn) {
              await authService.logout();
              if (!location.pathname.includes('/login')) {
                if (location.pathname !== '/dashboard') {
                  localStorage.setItem('redirectAfterLogin', location.pathname);
                }
                if (isMounted) {
                  // Redirect to Django login with next parameter
                  const nextParam = encodeURIComponent(`/#${location.pathname}`);
                  window.location.href = `http://localhost:8000/login/?next=${nextParam}`;
                }
              }
            }
          }
        } else {
          // No valid session or previous login
          console.log('No valid session found');
          if (!location.pathname.includes('/login') && isMounted) {
            console.log('Not authenticated, redirecting to login');
            if (location.pathname !== '/dashboard') {
              localStorage.setItem('redirectAfterLogin', location.pathname);
            }
            // Redirect to Django login with next parameter
            const nextParam = encodeURIComponent(`/#${location.pathname}`);
            window.location.href = `http://localhost:8000/login/?next=${nextParam}`;
            return; // Exit early to prevent further processing
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Only redirect to login if we're not already there
        if (!location.pathname.includes('/login') && isMounted) {
          console.log('Auth check failed, redirecting to login');
          if (location.pathname !== '/dashboard') {
            localStorage.setItem('redirectAfterLogin', location.pathname);
          }
          // Redirect to Django login with next parameter
          const nextParam = encodeURIComponent(`/#${location.pathname}`);
          window.location.href = `http://localhost:8000/login/?next=${nextParam}`;
          return; // Exit early to prevent further processing
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
        apiCallInProgress.current = false;
        hasMadeApiCall.current = true;
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      // Reset refs on cleanup
      hasMadeApiCall.current = false;
      apiCallInProgress.current = false;
    };
  }, [location.pathname, navigate]); // Removed hasCheckedAuth and isRedirecting from dependencies

  // Efficient language sync check
  useEffect(() => {
    if (!hasCheckedAuth || isChecking) return;

    const languageSyncService = LanguageSyncService.getInstance();
    const now = Date.now();
    const timeSinceLastSync = lastSyncTime ? now - lastSyncTime : Infinity;
    
    // Use quick sync check first to avoid unnecessary processing
    if (languageSyncService.quickSyncCheck()) {
      return;
    }

    // Only sync if it's been more than 15 seconds since last sync
    if (timeSinceLastSync > 15000) {
      console.log('Performing periodic language sync check...');
      languageSyncService.syncFromDjangoSession();
      setLastSyncTime(now);
    }
  }, [hasCheckedAuth, isChecking, lastSyncTime]);

  // Show nothing while checking initial auth state
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProvider; 