import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthToken } = useContext(AuthContext);
  
  useEffect(() => {
    // Extract token from URL query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      // Store token in local storage
      localStorage.setItem('authToken', token);
      
      // Update auth context
      setAuthToken(token);
      
      // Redirect to memories page or dashboard
      navigate('/memories');
    } else {
      // Handle error case - no token found
      navigate('/login');
    }
  }, [location, navigate, setAuthToken]);
  
  // Show loading state while processing
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
