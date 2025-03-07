import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Base64 encoded simple gray placeholder image (lightweight, no external dependencies)
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzU1NSI+SW1hZ2UgTG9hZGluZzwvdGV4dD48L3N2Zz4=';

function MemoryCard({ memory, forceRefresh = 0 }) {
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
      {/* Image container with proper aspect ratio */}
      <div className="relative aspect-video bg-gray-100">
        <img 
          src={Array.isArray(memory.url) ? memory.url[0] : memory.url}
          alt={memory.title}
          className="absolute w-full h-full object-cover" 
        />
      </div>
      
      {/* Content area */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-1 truncate">{memory.title}</h3>
        <p className="text-sm text-gray-500 mb-2">{new Date(memory.created_at).toLocaleDateString()}</p>
        <p className="text-gray-600 line-clamp-2 h-12 mb-3">{memory.description}</p>
        
        {/* Action buttons in a clean layout */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Details
          </button>
          <button className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
            <span>Share</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemoryCard;