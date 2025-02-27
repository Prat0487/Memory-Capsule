import React from 'react'
import { Link } from 'react-router-dom'

function MemoryCard({ memory }) {
  const { id, title, imageUrl, narrative, createdAt, type = 'image' } = memory
  
  // Define type-specific styling and icons
  const typeConfig = {
    image: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: 'from-blue-500 to-purple-600'
    },
    audio: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      bgColor: 'from-green-500 to-teal-600'
    },
    text: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'from-yellow-500 to-orange-600'
    }
  }
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1">
      {/* Card Header/Image */}
      {imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-xl font-bold line-clamp-1">{title}</h3>
            <p className="text-white/80 text-sm">
              {new Date(createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      ) : (
        <div className={`h-40 bg-gradient-to-r ${typeConfig[type]?.bgColor || 'from-blue-500 to-purple-600'} flex items-center justify-center p-6`}>
          <div className="text-white">
            {typeConfig[type]?.icon}
          </div>
          <div className="flex-1 ml-4">
            <h3 className="text-white text-xl font-bold line-clamp-1">{title}</h3>
            <p className="text-white/80 text-sm">
              {new Date(createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      )}
      
      {/* Card Content */}
      <div className="p-5">
        {!imageUrl && <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>}
        
        <p className="text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem]">{narrative}</p>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Link 
            to={`/memory/${id}`}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center group"
          >
            <span>View Details</span>
            <svg className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          <div className="flex space-x-1">
            <button 
              onClick={() => navigator.clipboard.writeText(`https://memory-capsule.io/share/${id}`)}
              className="p-2 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="Copy Share Link"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            </button>
            
            <button 
              className="p-2 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="More Options"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemoryCard