import React, { createContext, useState, useEffect } from 'react';

// Create the auth context
export const AuthContext = createContext();

// Create the auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Example: check localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      // Potentially verify token with backend here
    }
  }, []);

  // Sample function for Google signup
  const signupWithGoogle = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  // Regular email/password signup placeholder
  const signup = async (email, password) => {
    try {
      setLoading(true);
      // Make API call to your auth service here
      // Example:
      // const response = await fetch(…);
      // ...
      setLoading(false);
      return true; // or handle success/failure
    } catch (err) {
      setLoading(false);
      setError('Signup failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken('');
    setUser(null);
  };

  // Context value object
  const contextValue = {
    user,
    setUser,
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