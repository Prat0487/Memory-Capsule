import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MemoryCard } from '../components/MemoryCard';
import { motion } from 'framer-motion';

export function MemoriesPage() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  // Force refetch on navigation or memory creation
  const fetchMemories = async () => {
    setLoading(true);
    try {
      // Get the user's address from wherever you store it (localStorage, context, etc.)
      const address = localStorage.getItem('userAddress') || '0x69592f057c1Fd4D1a82758D91acAf5D37d2639F8';
      
      // Fetch with a cache-busting query parameter
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost:3000/memories/${address}?_=${timestamp}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.memories)) {
        // Apply proper data transformation before setting state
        const transformedMemories = data.memories.map(memory => ({
          ...memory,
          // Ensure dates are in ISO format if they aren't already
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
  
  useEffect(() => {
    fetchMemories();
    
    // Add an interval to refresh data periodically for new IPFS images to load
    const refreshInterval = setInterval(() => {
      fetchMemories();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(refreshInterval);
  }, [location.key]); // Re-fetch when the location changes (like after creating a memory)
  
  // Handle loading state with animation
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
      <h1 className="text-3xl font-bold mb-8">My Memories</h1>
      
      {memories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl">You haven't created any memories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map(memory => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      )}
    </div>
  );
}