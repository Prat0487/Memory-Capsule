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

  // Debug log to confirm the component actually renders
  console.log('MemoryCard component rendering, memory:', memory)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-4">
      <div className="p-4">
        <h3 className="text-gray-800 text-lg font-bold">
          {memory.title || 'Untitled Memory'}
        </h3>
        <p className="text-gray-600 mt-2">
          {memory.description || 'No description provided'}
        </p>

        {/* Just for debugging, so you see something clickable */}
        <div className="mt-4 flex">
          <button
            onClick={handleShare}
            style={{ backgroundColor: 'blue', color: 'white' }}
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