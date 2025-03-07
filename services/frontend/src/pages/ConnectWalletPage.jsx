import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ConnectWalletPage() {
  const { currentUser, connectWallet, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleConnectWallet = async () => {
    try {
      const success = await connectWallet();
      if (success) {
        navigate('/memories');
      }
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handleSkip = () => {
    navigate('/memories');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connect Your Wallet
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect a wallet to securely store your memories on the blockchain
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="mt-8 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">
              Hello, <span className="font-medium">{currentUser?.email}</span>!
              Connect your Ethereum wallet to enable blockchain-based storage and sharing.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleConnectWallet}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
              
              <button
                onClick={handleSkip}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectWalletPage;
