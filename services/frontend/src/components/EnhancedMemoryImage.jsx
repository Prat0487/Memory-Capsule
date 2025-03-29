import React, { useState } from 'react';
import axios from 'axios';

const EnhancedMemoryImage = ({ memory, onEnhanceComplete }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState('');
  
  // Determine the image URL based on storage type
  const getImageUrl = () => {
    if (!memory.enhancedImageHash) {
      // Use a gateway manager on the frontend too
      const gateways = [
        'https://gateway.pinata.cloud/ipfs/',
        'https://ipfs.io/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/'
      ];
      const gateway = gateways[Math.floor(Math.random() * gateways.length)];
      return `${gateway}${memory.ipfsHash}`;
    }
    
    // If we have a stored URL for the enhanced image, use it
    if (memory.enhancedImageUrl) {
      return memory.enhancedImageUrl;
    }
    
    // Check if this is a local storage reference
    if (memory.enhancedImageHash.startsWith('local_')) {
      const localId = memory.enhancedImageHash.replace('local_', '');
      return `/local-image/${localId}`;
    }
    
    // Regular IPFS hash - use random gateway
    const gateways = [
      'https://gateway.pinata.cloud/ipfs/',
      'https://ipfs.io/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/'
    ];
    const gateway = gateways[Math.floor(Math.random() * gateways.length)];
    return `${gateway}${memory.enhancedImageHash}`;
  };
  
  const imageUrl = getImageUrl();
  
  const handleEnhanceImage = async () => {
    try {
      setIsEnhancing(true);
      setError('');
      
      const response = await axios.post('/api/blockchain/enhance-memory-image', {
        memoryId: memory.id,
        ipfsHash: memory.ipfsHash,
        description: memory.description
      });
      
      if (response.data.success) {
        onEnhanceComplete(response.data.memory);
      }
    } catch (error) {
      console.error('Error enhancing image:', error);
      setError('Network issues when enhancing image. Please try again later.');
    } finally {
      setIsEnhancing(false);
    }
  };
  
  return (
    <div className="relative group">
      <img 
        src={imageUrl} 
        alt={memory.title || 'Memory'} 
        className="w-full h-64 object-cover rounded-xl shadow-soft"
        onError={(e) => {
          // Fallback if image fails to load
          e.target.onerror = null;
          e.target.src = '/images/placeholder-image.jpg';
        }}
      />
      
      {!memory.enhancedImageHash && (
        <div className="absolute bottom-2 right-2">
          <button
            onClick={handleEnhanceImage}
            disabled={isEnhancing}
            className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            {isEnhancing ? 'Enhancing...' : 'Enhance Image'}
          </button>
        </div>
      )}
      
      {memory.enhancedImageHash && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs">
          Enhanced
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
};

export default EnhancedMemoryImage;
