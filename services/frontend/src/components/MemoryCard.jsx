import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export function MemoryCard({ memory }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [imageSrc, setImageSrc] = useState(memory.url || 'https://via.placeholder.com/300?text=Loading')
  
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
  
  // Retry logic for new IPFS content
  useEffect(() => {
    if (!memory.url || imageLoaded) return
    
    // Check if the memory was created recently (within last hour)
    const isNewMemory = () => {
      try {
        const creationTime = new Date(memory.created_at).getTime()
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        return creationTime > oneHourAgo
      } catch (e) {
        return false
      }
    }
    
    // Only apply retry logic to new memories
    if (isNewMemory() && retryCount < 5) {
      const retryTimer = setTimeout(() => {
        // Force image refresh by adding timestamp parameter
        setImageSrc(`${memory.url}?retry=${Date.now()}`)
        setRetryCount(prevCount => prevCount + 1)
      }, 3000 * (retryCount + 1)); // Increasing backoff timing
      
      return () => clearTimeout(retryTimer)
    }
  }, [memory.url, imageLoaded, retryCount, memory.created_at])
  
  return (
    <div className="memory-card rounded-lg shadow-md overflow-hidden bg-white">
      <div className="memory-image h-48 overflow-hidden relative">
        {!imageLoaded && retryCount > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-sm text-gray-500">Loading from IPFS...</p>
          </div>
        )}
        <img 
          src={imageSrc}
          alt={memory.title || 'Memory'} 
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // If we've exceeded retries, show error placeholder
            if (retryCount >= 5) {
              e.target.src = 'https://via.placeholder.com/300?text=Content+Loading'
            }
          }}
        />
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
  )
}