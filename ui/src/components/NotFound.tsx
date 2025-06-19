import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../utils/auth_service';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const authService = AuthService.getInstance();

  useEffect(() => {
    // Check authentication status and redirect accordingly
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Return null since we're redirecting anyway
  return null;
};

export default NotFound; 