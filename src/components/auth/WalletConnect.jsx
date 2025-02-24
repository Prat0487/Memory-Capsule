// src/components/auth/WalletConnect.jsx
import React, { useEffect } from 'react'
import { useUser } from '../../context/UserContext'

function WalletConnect() {
  const { user, loading, connectWallet, checkConnection } = useUser()

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">
            {user.address.slice(0, 6)}...{user.address.slice(-4)}
          </span>
          <span className="text-xs text-gray-500">
            {Number(user.balance).toFixed(4)} ETH
          </span>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  )
}

export default WalletConnect