import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import axios from 'axios';
import { MemoryCard } from '../components/MemoryCard';import { motion } from 'framer-motion';

function MemoriesPage() {
  const { account, connectWallet } = useWallet();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (account) {
      fetchMemories();
    }
  }, [account]);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/memories/${account}`);
      if (response.data.success) {
        setMemories(response.data.memories || []);
      }
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMemories = memories.filter(memory => {
    if (filter === 'all') return true;
    if (filter === 'image' && memory.type === 'image') return true;
    if (filter === 'audio' && memory.type === 'audio') return true;
    if (filter === 'text' && memory.type === 'text') return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Memory Collection</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse through your preserved memories or create new ones to add to your collection.
          </p>
        </div>
        
        {!account ? (
          <div className="text-center max-w-md mx-auto py-16 bg-white rounded-xl shadow-sm">
            <svg className="w-20 h-20 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8 px-8">
              Connect your wallet to access your preserved memories from the blockchain.
            </p>
            <button 
              onClick={connectWallet}
              className="px-8 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all"
            >
              Connect Wallet
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex space-x-2 mb-4 md:mb-0">
                {['all', 'image', 'audio', 'text'].map(option => (
                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filter === option 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
              
              <a 
                href="/create" 
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Memory
              </a>
            </div>
            
            {filteredMemories.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h2 className="text-2xl font-semibold mb-2">No memories found</h2>
                <p className="text-gray-600 mb-6">Create your first memory to get started.</p>
                <a 
                  href="/create" 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Create Memory
                </a>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredMemories.map((memory, index) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <MemoryCard memory={memory} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MemoriesPage;