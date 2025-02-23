// src/components/memory/MemoryCapsuleView.jsx
import React from 'react'
import { getIPFSUrl } from '../../services/ipfs'

function MemoryCapsuleView({ memory = null }) {
  // If no memory is provided, show empty state
  if (!memory) {
    return (
      <div className="p-6 glass-effect rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Your Memories</h2>
        <p className="text-gray-600">
          No memories found. Create your first memory above!
        </p>
      </div>
    )
  }

  // Show memory details when available
  return (
    <div className="p-6 glass-effect rounded-xl">
      <h2 className="text-2xl font-bold mb-4">{memory.title}</h2>
      <p className="text-gray-600 mb-4">{memory.description}</p>
      
      {memory.files?.map((file, index) => (
        <div key={index} className="mb-4">
          <p className="font-medium">{file.name}</p>
          <a 
            href={getIPFSUrl(file.cid)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View File
          </a>
        </div>
      ))}
    </div>
  )
}

export default MemoryCapsuleView