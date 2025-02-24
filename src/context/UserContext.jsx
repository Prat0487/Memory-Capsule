// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { connectWallet, verifyWalletConnection } from '../services/wallet'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [providerReady, setProviderReady] = useState(false)

  useEffect(() => {
    const checkProvider = () => {
      if (window.ethereum) {
        setProviderReady(true)
        checkConnection()
      }
    }
    
    checkProvider()
    window.addEventListener('ethereum#initialized', checkProvider)
    
    return () => {
      window.removeEventListener('ethereum#initialized', checkProvider)
    }
  }, [])

  const handleConnect = async () => {
    if (!providerReady) {
      alert("Please install MetaMask to connect wallet")
      return
    }

    setLoading(true)
    try {
      const walletData = await connectWallet()
      setUser({
        address: walletData.address,
        balance: walletData.balance,
        connected: true
      })
    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const checkConnection = async () => {
    if (providerReady) {
      const isConnected = await verifyWalletConnection()
      if (isConnected) {
        handleConnect()
      }
    }
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      loading,
      providerReady,
      connectWallet: handleConnect,
      checkConnection 
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}