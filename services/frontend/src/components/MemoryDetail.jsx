import React, { useState, useEffect } from 'react';

function MemoryDetail({ memory }) {
  const [showEnhanced, setShowEnhanced] = useState(true);
  
  // Function to get the appropriate image source
  const getImageSource = () => {
    // If enhanced version exists and user wants to see it
    if (memory.enhancedImageUrl && showEnhanced) {
      return memory.enhancedImageUrl;
    }
    
    // Otherwise show original from IPFS
    return memory.url || `https://gateway.pinata.cloud/ipfs/${memory.ipfsHash}`;
  };
  
  return (
    <div className="memory-detail">
      <h1>{memory.title}</h1>
      <p>{memory.description}</p>
      
      {memory.hasEnhancedVersion && (
        <div className="enhancement-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={showEnhanced} 
              onChange={() => setShowEnhanced(!showEnhanced)} 
            />
            Show Enhanced Version
          </label>
        </div>
      )}
      
      <div className="memory-image">
        <img 
          src={getImageSource()} 
          alt={memory.title} 
          onError={(e) => {
            // If enhanced image fails, fallback to original
            if (showEnhanced && memory.enhancedImageUrl) {
              console.log('Enhanced image failed to load, falling back to original');
              setShowEnhanced(false);
            }
          }}
        />
      </div>
      
      {memory.narrative && (
        <div className="memory-narrative">
          <h3>Memory Narrative</h3>
          <p>{memory.narrative}</p>
        </div>
      )}
    </div>
  );
}
