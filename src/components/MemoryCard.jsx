import React from 'react'
import { trackMemoryShare } from '../services/blockchain'

export function MemoryCard({ memory }) {
  const handleShare = () => {
    if (!memory?.id) {
      console.error('No memory ID found, cannot share memory.')
      return
    }
    const shareUrl = `${window.location.origin}/shared-memory/${memory.id}`
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('Memory link copied to clipboard!')
      })
      .catch((err) => {
        console.error('Failed to copy link:', err)
      })
    trackMemoryShare(memory.id)
  }

  // Debug log to identify file structure
  console.log('Memory data:', memory)
  console.log('Files data:', memory.files || memory.ipfsHash || 'No file data found')

  // Helper function to render files or IPFS content
  const renderMedia = () => {
    // Option 1: If memory has a files array (newer format)
    if (memory.files && memory.files.length > 0) {
      return (
        <div className="mt-3">
          {memory.files.map((file, index) => (
            <div key={index} className="mt-2">
              {file.type.startsWith('image/') ? (
                <img 
                  src={file.url} 
                  alt={file.name || 'Memory image'} 
                  className="w-full h-48 object-cover rounded-md shadow-sm hover:opacity-95 transition-opacity" 
                />
              ) : (
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {file.name || 'View file'}
                </a>
              )}
            </div>
          ))}
        </div>
      )
    }
    
    // Option 2: If memory has an ipfsHash (older format)
    else if (memory.ipfsHash) {
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${memory.ipfsHash}`
      return (
        <div className="mt-3">
          <img 
            src={ipfsUrl} 
            alt="Memory content" 
            className="w-full rounded-md max-h-48 object-cover" 
          />
        </div>
      )
    }
    
    // Option 3: If memory has direct image URL
    else if (memory.imageUrl) {
      return (
        <div className="mt-3">
          <img 
            src={memory.imageUrl} 
            alt="Memory content" 
            className="w-full rounded-md max-h-48 object-cover" 
          />
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-4">
      <div className="p-4">
        <h3 className="text-gray-800 text-lg font-bold">
          {memory.title || 'Untitled Memory'}
        </h3>
        <p className="text-gray-600 mt-2">
          {memory.description || 'No description provided'}
        </p>
        
        {/* Media content - images or files */}
        {renderMedia()}

        {/* Action buttons */}
        <div className="mt-4 flex">
          <button
            onClick={handleShare}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
          >
            Share Memory
          </button>

          <button
            onClick={() => alert('Test button clicked!')}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            TEST BUTTON
          </button>
        </div>
      </div>
    </div>
  )
}