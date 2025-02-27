import React from 'react'
import { useUser } from '../../context/UserContext'

function WalletConnect() {
  const { currentUser, loading, connectWallet } = useUser()
  
  // Format the wallet address to be more readable
  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }
  
  // Format the ETH balance to show only a few decimal places
  const formatBalance = (balance) => {
    if (!balance) return '0.0'
    return parseFloat(balance).toFixed(4)
  }

  const handleConnectClick = () => {
    connectWallet().catch(error => {
      console.error('Connection error:', error)
    })
  }

  return (
    <div className="wallet-connect">
      {currentUser && currentUser.connected ? (
        <div className="flex items-center bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <div className="mr-2">
            <div className="text-sm font-medium">{formatAddress(currentUser.address)}</div>
            <div className="text-xs text-green-600">{formatBalance(currentUser.balance)} ETH</div>
          </div>
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
        </div>
      ) : (
        <button
          onClick={handleConnectClick}
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  )
}

export default WalletConnect