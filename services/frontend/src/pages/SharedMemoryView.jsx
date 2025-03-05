import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function SharedMemoryView() {
  const { id } = useParams();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedMemory = async () => {
      try {
        console.log(`Fetching shared memory with ID: ${id}`);
        const response = await axios.get(`/api/memories/shared/${id}`);
        
        console.log('API response:', response.data); // Debug the response

        // Handle different API response formats
        if (response.data && response.data.success && response.data.memory) {
          setMemory(response.data.memory);
        } else if (response.data && !response.data.success) {
          setError(response.data.error || 'Memory not found');
        } else if (response.data) {
          // If data is returned directly without a wrapper
          setMemory(response.data);
        } else {
          setError('Unexpected API response format');
        }
      } catch (err) {
        console.error('Error fetching shared memory:', err);
        setError('Failed to load memory');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSharedMemory();
  }, [id]);

  // Format date safely to prevent "Invalid Date"
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-4">Loading shared memory...</p>
      </div>
    );
  }
  
  if (error || !memory) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md mx-auto">
          <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Memory Not Found</h2>
          <p className="mb-6 text-gray-600">This memory could not be loaded or does not exist.</p>
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  // Debug what fields we have
  console.log('Memory data:', {
    title: memory.title,
    description: memory.description,
    ipfsHash: memory.ipfsHash,
    createdAt: memory.createdAt || memory.created_at,
    date: formatDate(memory.createdAt || memory.created_at)
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Image display with fallbacks for different field names */}
        {(memory.ipfsHash || memory.url) && (
          <div className="h-80 overflow-hidden">
            <img 
              src={memory.url || 
                (memory.ipfsHash ? `https://ipfs.io/ipfs/${memory.ipfsHash}` : null) || 
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle"%3ENo Image Available%3C/text%3E%3C/svg%3E'}
              alt={memory.title || "Shared memory"}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if initial image load fails
                if (e.target.src.includes('ipfs.io') && memory.ipfsHash) {
                  e.target.src = `https://cloudflare-ipfs.com/ipfs/${memory.ipfsHash}`;
                } else if (e.target.src.includes('cloudflare-ipfs') && memory.ipfsHash) {
                  e.target.src = `https://gateway.pinata.cloud/ipfs/${memory.ipfsHash}`;
                } else {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle"%3EImage Unavailable%3C/text%3E%3C/svg%3E';
                }
              }}
            />
          </div>
        )}
        
        <div className="p-8">
          <div className="flex flex-col mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{memory.title || "Shared Memory"}</h1>
            <p className="text-gray-600 mt-1">
              Created on {formatDate(memory.createdAt || memory.created_at)}
            </p>
          </div>
          
          <div className="prose max-w-none mb-8">
            <p className="text-lg">{memory.description || "This is a shared memory from Memory Capsule. Create your own memories by visiting our website."}</p>
          </div>
          
          {memory.narrative && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Memory Narrative</h3>
              <p className="text-gray-800 italic">{memory.narrative}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              ← Go to Memory Capsule
            </Link>
            
            <Link to="/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Your Memory Capsule
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharedMemoryView;