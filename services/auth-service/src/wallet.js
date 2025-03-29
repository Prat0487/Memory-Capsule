import { ethers } from 'ethers'

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask to connect wallet")
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const balance = await provider.getBalance(address)
    
    return {
      address,
      balance: ethers.utils.formatEther(balance),
      signer
    }
  } catch (error) {
    console.error("Wallet connection details:", error)
    throw new Error("Failed to connect wallet: " + error.message)
  }
}

export const verifyWalletConnection = async () => {
  if (!window.ethereum) return false
  
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const accounts = await provider.listAccounts()
  return accounts.length > 0
}