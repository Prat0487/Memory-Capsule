import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    const userAddress = localStorage.getItem('userAddress');
    
    if (token) {
      setCurrentUser({
        email: userEmail,
        address: userAddress
      });
      setIsAuthenticated(true);
    }
  }, []);

  const signup = async (email, password, confirmPassword) => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:3001/auth/signup', {
        email,
        password
      });
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userEmail', email);
        
        setCurrentUser({
          email,
          address: null
        });
        setIsAuthenticated(true);
        return true;
      } else {
        setError(response.data.message || 'Failed to create account');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during signup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signupWithGoogle = async () => {
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, you would:
      // 1. Redirect to Google OAuth consent screen
      // 2. Handle the callback with a code
      // 3. Exchange code for tokens on your backend
      
      window.location.href = 'http://localhost:3001/auth/google';
      return true; // This line won't actually execute due to the redirect
    } catch (err) {
      setError('Google authentication failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userEmail', email);
        if (response.data.walletAddress) {
          localStorage.setItem('userAddress', response.data.walletAddress);
        }
        
        setCurrentUser({
          email,
          address: response.data.walletAddress || null
        });
        setIsAuthenticated(true);
        return true;
      } else {
        setError(response.data.message || 'Invalid credentials');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        setError('Please install MetaMask to connect your wallet');
        return false;
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // Update user profile with wallet address
      const response = await axios.post('http://localhost:3000/auth/connect-wallet', {
        email: currentUser.email,
        walletAddress: address
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.data.success) {
        localStorage.setItem('userAddress', address);
        
        setCurrentUser(prev => ({
          ...prev,
          address
        }));
        
        return true;
      } else {
        setError(response.data.message || 'Failed to connect wallet');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect wallet');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAddress');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Listen for wallet changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0 && currentUser && currentUser.address !== accounts[0]) {
          setCurrentUser(prev => ({
            ...prev,
            address: accounts[0]
          }));
          localStorage.setItem('userAddress', accounts[0]);
        } else if (accounts.length === 0 && currentUser?.address) {
          setCurrentUser(prev => ({
            ...prev,
            address: null
          }));
          localStorage.removeItem('userAddress');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        error,
        signup,
        signupWithGoogle,
        login,
        logout,
        connectWallet,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};