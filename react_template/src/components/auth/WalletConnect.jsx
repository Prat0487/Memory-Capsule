// src/components/auth/WalletConnect.jsx
import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';

function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectWallet, user } = useUser();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {!user ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="text-gray-700">
          <p className="font-medium">Connected Wallet</p>
          <p className="text-sm truncate">{user.address}</p>
        </div>
      )}
    </div>
  );
}

export default WalletConnect;