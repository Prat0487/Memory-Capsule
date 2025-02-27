// src/components/memory/MemoryCapsuleView.jsx
import React from 'react'

function MemoryCapsuleView({ memory = null }) {
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

  return (
    <div className="p-6 glass-effect rounded-xl">
      <h2 className="text-2xl font-bold mb-4">{memory.title}</h2>
      <p className="text-gray-600 mb-4">{memory.description}</p>
      
      {memory.files?.map((file, index) => (
        <div key={index} className="mb-4">
          <p className="font-medium">{file.name}</p>
          <a 
            href={file.url}
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