import React from 'react'
import { Link } from 'react-router-dom'

export function MemoryCard({ memory }) {
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

  // Ensure we have proper image URL handling
  const imageUrl = memory.url || 'https://via.placeholder.com/300?text=No+Image'
  
  return (
    <div className="memory-card rounded-lg shadow-md overflow-hidden bg-white">
      <div className="memory-image h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={memory.title || 'Memory'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300?text=Error+Loading'
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