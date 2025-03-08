import React, { useState, createContext } from 'react';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  
  // Extremely minimal implementation
  const signupWithGoogle = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };
  
  const value = { 
    isAuthenticated: Boolean(token),
    setToken,
    signupWithGoogle
  };
  
  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};
