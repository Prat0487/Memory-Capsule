import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Base64 encoded simple gray placeholder image (lightweight, no external dependencies)
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzU1NSI+SW1hZ2UgTG9hZGluZzwvdGV4dD48L3N2Zz4=';

export function MemoryCard({ memory, forceRefresh = 0 }) {
  const [imageKey, setImageKey] = useState(forceRefresh);
  const [imageError, setImageError] = useState(false);
  
  // Update internal refresh key when external force refresh occurs
  useEffect(() => {
    setImageKey(forceRefresh);
    setImageError(false); // Reset error state on refresh
  }, [forceRefresh]);
  
  // Format date using native JavaScript
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      
      // Check for valid date
      if (isNaN(date.getTime())) {
        return 'Recently'
      }
      
      // Get time difference in days
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return 'Today'
      } else if (diffDays === 1) {
        return 'Yesterday'
      } else if (diffDays < 30) {
        return `${diffDays} days ago`
      } else {
        // Format as month day, year
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    } catch (e) {
      return 'Recently'
    }
  }
  
  return (
    <div className="memory-card rounded-lg shadow-md overflow-hidden bg-white">
      <div className="memory-image h-48 overflow-hidden relative">
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
            <p>Content loading from IPFS...</p>
          </div>
        )}
        <div>
          <p>Debug URL: {JSON.stringify(memory.url)}</p>
          <img 
            src={Array.isArray(memory.url) ? memory.url[0] : memory.url} 
            alt={memory.title} 
            onError={(e) => console.error("Image loading error", e)}
            className={`w-full h-full object-cover ${imageError ? 'opacity-20' : ''}`}
          />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{memory.title}</h3>
        <p className="text-gray-600 mb-2">{formatDate(memory.created_at)}</p>
        <p className="text-gray-800 mb-4">{memory.description || 'No description provided'}</p>
        
        <div className="flex justify-between">
          <Link 
            to={`/memories/${memory.id}`} 
            className="text-blue-500 hover:text-blue-700"
            state={{ memory }}
          >
            View Details
          </Link>
          <button className="text-green-500 hover:text-green-700">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}