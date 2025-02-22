// src/context/UserContext.jsx
import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const connectWallet = async () => {
    // Mock wallet connection
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          address: '0x' + Math.random().toString(36).substring(2, 40),
          balance: '1.5 ETH'
        };
        setUser(mockUser);
        resolve(mockUser);
      }, 1000);
    });
  };

  const disconnectWallet = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, connectWallet, disconnectWallet }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}