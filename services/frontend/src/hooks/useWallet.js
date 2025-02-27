import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        setProvider(provider);
        return { address, provider };
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      console.log("Please install MetaMask to use this feature");
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setProvider(provider);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
      setLoading(false);
    };
    
    checkConnection();
  }, []);

  return { account, provider, connectWallet, loading };
}
