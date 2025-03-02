import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MemoryCard } from '../components/MemoryCard';
import { motion } from 'framer-motion';

export function MemoriesPage() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key state
  const location = useLocation();
  
  const fetchMemories = async () => {
    setLoading(true);
    try {
      const address = localStorage.getItem('userAddress') || '0x69592f057c1Fd4D1a82758D91acAf5D37d2639F8';
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost:3000/memories/${address}?_=${timestamp}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.memories)) {
        const transformedMemories = data.memories.map(memory => ({
          ...memory,
          created_at: memory.created_at || new Date().toISOString() 
        }));
        setMemories(transformedMemories);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle manual refresh when button is clicked
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment refresh key to force re-render
    fetchMemories(); // Fetch fresh data
  };
  
  useEffect(() => {
    fetchMemories();
  }, [location.key]); // Re-fetch when location changes
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Memories</h1>
        
        {/* Refresh button with visual feedback */}
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Memories
        </button>
      </div>
      
      {memories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl">You haven't created any memories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map(memory => (
            <MemoryCard 
              key={`${memory.id}-${refreshKey}`} // Keep the component key for re-rendering
              memory={memory} // Pass the unmodified memory object
              forceRefresh={refreshKey} // Pass refresh key as a separate prop
            />
          ))}
        </div>
      )}
    </div>
  );
}