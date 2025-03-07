import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userAddress = localStorage.getItem('userAddress');
    
    if (token && userAddress) {
      setCurrentUser({ address: userAddress });
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (address, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        address,
        password
      });
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userAddress', address);
        setCurrentUser({ address });
        return true;
      } else {
        setError(response.data.error || 'Login failed');
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (address, password, confirmPassword) => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:3000/api/auth/signup', {
        address,
        password
      });
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userAddress', address);
        setCurrentUser({ address });
        return true;
      } else {
        setError(response.data.error || 'Signup failed');
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Signup failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAddress');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      error, 
      login, 
      signup, 
      logout,
      isAuthenticated: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
