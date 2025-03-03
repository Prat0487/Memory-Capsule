import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Link, useNavigate } from 'react-router-dom';

// Enhanced Memory Card component (replaces your existing MemoryCard component)
const MemoryCard = ({ memory }) => {
  const navigate = useNavigate();
  
  const handleViewDetails = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/memory/${memory.id}`);
  };
  
  const handleShare = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    // We'll implement share functionality in a moment
    navigate(`/memory/${memory.id}?action=share`);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      {/* Image container remains the same */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img 
          src={Array.isArray(memory.url) ? memory.url[0] : memory.url}
          alt={memory.title}
          className="absolute w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      {/* Content area */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold text-gray-800 mb-1 truncate">{memory.title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {new Date(memory.created_at).toLocaleDateString()}
        </p>
        <p className="text-gray-600 line-clamp-2 mb-3 flex-grow">{memory.description}</p>
        
        {/* Action buttons with explicit click handlers */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-auto">
          <button 
            onClick={handleViewDetails}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none transition-colors"
          >
            View Details
          </button>
          <button 
            onClick={handleShare}
            className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center focus:outline-none transition-colors"
          >
            <span>Share</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export function MemoriesPage() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
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
  
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
    fetchMemories();
  };
  
  useEffect(() => {
    fetchMemories();
  }, [location.key]);
  
  // Enhanced loading animation
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-lg text-gray-600 animate-pulse">Loading your memories...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Memories</h1>
        
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Memories
        </button>
      </div>
      
      {memories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xl text-gray-600 mb-4">You haven't created any memories yet.</p>
          <a href="/create" className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Create Your First Memory
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {memories.map(memory => (
            <div key={`${memory.id}-${refreshKey}`} className="h-full">
              <MemoryCard memory={memory} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}