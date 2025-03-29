import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchMemoryById } from '../services/memoryService';
import ShareMemory from './ShareMemory';

export function MemoryDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
      const [memory, setMemory] = useState(location.state?.memory || null);
      const [loading, setLoading] = useState(!memory);
      const [error, setError] = useState(null);
      const [showOriginal, setShowOriginal] = useState(false);
      const [originalImageHash, setOriginalImageHash] = useState('');
  
      useEffect(() => {
        if (!memory) {
          setLoading(true);
          fetchMemoryById(id)
            .then(data => {
              setMemory(data);
              setLoading(false);
            })
            .catch(err => {
              console.error('Error fetching memory details:', err);
              setError('Failed to load memory details');
              setLoading(false);
            });
        }
      }, [id, memory]);

      useEffect(() => {
        if (memory && memory.metadata && memory.metadata.originalHash) {
          setOriginalImageHash(memory.metadata.originalHash);
        }
      }, [memory]);
  
      if (loading) return <div className="text-center py-8">Loading memory details...</div>;
  
      if (error || !memory) {
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Memory not found</h2>
            <p className="mb-6">The memory you're looking for might have been removed or is unavailable.</p>
            <button 
              onClick={() => navigate('/memories')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Return to Memories
            </button>
          </div>
        );
      }
  
      return (
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4">{memory.title}</h1>
      
          <div className="relative mb-6">
            <img 
              src={showOriginal && originalImageHash 
                ? `https://ipfs.io/ipfs/${originalImageHash}` 
                : memory.url} 
              alt={memory.title} 
              className="w-full max-h-96 object-contain rounded"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=Error+Loading+Image';
              }}
            />
        
            {originalImageHash && (
              <div className="absolute bottom-4 right-4">
                <button 
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="bg-black/70 hover:bg-black/90 text-white text-sm rounded-lg px-3 py-1 transition-colors"
                >
                  {showOriginal ? "View Enhanced" : "View Original"}
                </button>
              </div>
            )}
        
            {originalImageHash && !showOriginal && (
              <div className="absolute top-4 right-4">
                <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded-full">
                  AI Enhanced
                </span>
              </div>
            )}
          </div>
      
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Created: {new Date(memory.created_at).toLocaleDateString()}
            </p>
            <p className="text-lg">{memory.description}</p>
          </div>
      
          {memory.narrative && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Narrative</h2>
              <p className="italic">{memory.narrative}</p>
            </div>
          )}
      
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">IPFS Details</h2>
            <p>Hash: {memory.ipfsHash}</p>
            {originalImageHash && (
              <p>Original Hash: {originalImageHash}</p>
            )}
            <a 
              href={memory.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on IPFS
            </a>
          </div>
      
      <ShareMemory memoryId={memory.id} />
      
      <button 
        onClick={() => navigate('/memories')}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Back to Memories
      </button>
    </div>
  );
}