import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();
  
  // Check if user is logged in on page refresh
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_AUTH_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data.user);
          } else {
            // Invalid token, logout
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    
    verifyToken();
  }, [token]);
  
  // Traditional login
  const login = async (email, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      const data = await response.json();
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  // Register
  const register = async (email, password, name) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      const data = await response.json();
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };
  
  // Web3 wallet connection
  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // Get authentication nonce
      const nonceResponse = await fetch(`${import.meta.env.VITE_AUTH_URL}/api/auth/nonce/${address}`);
      const { nonce } = await nonceResponse.json();
      
      // Sign message with wallet
      const message = `Login to Memory Capsule with nonce: ${nonce}`;
      const signature = await signer.signMessage(message);
      
      // Authenticate with backend
      const authResponse = await fetch(`${import.meta.env.VITE_AUTH_URL}/api/auth/wallet`, {
        method: 'POST',
