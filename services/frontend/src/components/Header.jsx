import React, { useState } from 'react'
import { ethers } from 'ethers'

function Header() {
  const [account, setAccount] = useState(null)

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setAccount(address)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    } else {
      alert('MetaMask not detected. Please install a Web3 wallet.')
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 shadow-md">
      <h1 className="text-2xl font-bold text-white tracking-wider">Memory Capsule</h1>
      {account ? (
        <span className="text-white font-medium">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-white text-indigo-500 font-semibold px-4 py-2 rounded-md shadow hover:bg-gray-100 transition-colors duration-200"
        >
          Connect Wallet
        </button>
      )}
    </header>
  )
}

export default Header