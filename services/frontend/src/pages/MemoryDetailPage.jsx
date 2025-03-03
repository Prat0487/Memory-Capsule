import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import axios from 'axios';
import ShareMemory from '../components/ShareMemory';
import IpfsImage from '../components/IpfsImage';

function MemoryDetailPage() {
  const { id } = useParams();
  const { account } = useWallet();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const address = localStorage.getItem('userAddress') || '0x69592f057c1Fd4D1a82758D91acAf5D37d2639F8';
        
        // Fetch all memories for this user
        const response = await axios.get(`http://localhost:3000/memories/${address}`);
        
        if (response.data && response.data.success && response.data.memories) {
          // Find the specific memory by ID
          const foundMemory = response.data.memories.find(memory => memory.id == id);
          
          if (foundMemory) {
            setMemory(foundMemory);
          } else {
            setError('Memory not found in your collection');
          }
        } else {
          setError('Failed to load memories');
        }
      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to load memory');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemory();
  }, [id]);
  
  // Add this temporarily to see the exact structure of your memory object
  useEffect(() => {
    if (memory) {
      console.log("Memory object structure:", memory);
      console.log("Date fields:", {
        createdAt: memory.createdAt,
        created_at: memory.created_at,
        timestamp: memory.timestamp
      });
    }
  }, [memory]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-4">Loading memory...</p>
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
          <h2 className="text-xl font-bold mb-2">{error || 'Memory not found'}</h2>
          <p className="mb-6 text-gray-600">The memory you're looking for might have been removed or is unavailable.</p>
          <Link to="/memories" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Return to Memories
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {memory.ipfsHash ? (
          <div className="relative">
            {/* Dynamic height container with aspect ratio preservation */}
            <div className="w-full aspect-[16/9] bg-gray-50 overflow-hidden rounded-t-xl">
              <IpfsImage 
                hash={memory.ipfsHash} 
                alt={memory.title || "Memory image"}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Image controls overlay */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button 
                onClick={() => window.open(`https://ipfs.io/ipfs/${memory.ipfsHash}`, '_blank')}
                className="bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
                title="View full size"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 8a5 5 0 1110 0A5 5 0 013 8zm5-3a3 3 0 100 6 3 3 0 000-6zm-1 8a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zm8-3a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center rounded-t-xl">
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{memory.title}</h1>
              <p className="text-gray-600 mt-1">
                Created: {memory.createdAt 
                  ? new Date(memory.createdAt).toLocaleDateString() 
                  : memory.created_at 
                    ? new Date(memory.created_at).toLocaleDateString()
                    : "Date unavailable"}
              </p>
            </div>
            
            {memory.ipfsHash && (
              <a 
                href={`https://ipfs.io/ipfs/${memory.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
              >
                <span>View on IPFS</span>
                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          
          <div className="prose max-w-none mb-8">
            <p className="text-lg">{memory.description}</p>
          </div>
          
          {memory.narrative && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">AI Generated Narrative</h3>
              <p className="text-gray-800 italic">{memory.narrative}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Link to="/memories" className="text-blue-600 hover:text-blue-800">
              ← Back to Memories
            </Link>
            
            <button 
              onClick={() => navigator.clipboard.writeText(`https://memory-capsule.io/shared/${memory.id}`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share Memory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemoryDetailPage;