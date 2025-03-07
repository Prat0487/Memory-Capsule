import React, { createContext, useState, useEffect } from 'react';

// Create the auth context
export const AuthContext = createContext();

// Create the auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      // You could add a verification request here
    }
  }, []);

  // Sign up with Google
  const signupWithGoogle = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  // Normal signup
  const signup = async (email, password) => {
    // Implementation for regular signup
    return false;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
  };

  // Create the context value object with all functions and state
  const contextValue = {
    user,
    authToken,
    setAuthToken,
    loading,
    error,
    signupWithGoogle,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};