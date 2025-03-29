// src/components/memory/MemoryCard.jsx
import React from 'react';

function MemoryCard({ memory }) {
  const { title, description, narrative, ipfsHashes, timestamp } = memory;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {ipfsHashes && ipfsHashes[0] && (
        <div className="relative h-48">
          <img
            src={`https://ipfs.io/ipfs/${ipfsHashes[0]}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{formatDate(timestamp)}</p>
        
        <div className="mb-3">
          <p className="text-gray-700 line-clamp-2">{description}</p>
        </div>
        
        {narrative && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 italic">{narrative}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            View Details
          </button>
          <span className="text-xs text-gray-500">
            {ipfsHashes?.length || 0} items
          </span>
        </div>
      </div>
    </div>
  );
}

export default MemoryCard;