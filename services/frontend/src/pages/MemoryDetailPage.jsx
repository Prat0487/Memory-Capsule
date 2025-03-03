import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import axios from 'axios';
import ShareMemory from '../components/ShareMemory';

function MemoryDetailPage() {
  const { id } = useParams();
  const { account } = useWallet();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchMemory = async () => {
      try {
        // Try these variations one at a time:
        const response = await axios.get(`/memories/${id}`);  // Direct to service
        // const response = await axios.get(`/memory-service/memories/${id}`);  // With service prefix
        // const response = await axios.get(`/api/blockchain/memories/${id}`);  // Through blockchain service
        
        // Check the actual response structure and update accordingly
        if (response.data && response.data.memory) {
          setMemory(response.data.memory);
        } else if (response.data) {
          // Some APIs return the data directly without a wrapper object
          setMemory(response.data);
        } else {
          setError('Memory data format unexpected');
        }
      } catch (err) {
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to load memory');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemory();
  }, [id]);
  
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
        {memory.ipfsHash && (
          <div className="h-80 overflow-hidden">
            <img 
              src={getOptimizedIpfsUrl(memory.ipfsHash)}
              alt={memory.title || "Memory image"} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Try next gateway on error
                const currentSrc = e.target.src
                const currentGateway = currentSrc.split('/ipfs/')[0]
                const hash = memory.ipfsHash
                
                // Find next gateway to try
                const gateways = [
                  'https://ipfs.io',
                  'https://cloudflare-ipfs.com',
                  'https://dweb.link'
                ]
                
                const currentIndex = gateways.findIndex(gw => currentSrc.startsWith(gw))
                if (currentIndex < gateways.length - 1) {
                  e.target.src = `${gateways[currentIndex + 1]}/ipfs/${hash}`
                } else {
                  // Fall back to a placeholder if all gateways fail
                  e.target.src = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e2e8f0' width='400' height='300'/%3E%3Ctext fill='%2394a3b8' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EImage Unavailable%3C/text%3E%3C/svg%3E`
                }
              }}
            />
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
