import React, { useEffect, useState } from 'react'
import { MemoryCard } from './MemoryCard'
import { getMemories } from '../services/blockchain'

import { useUser } from '../context/UserContext'

export function MemoryGallery() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)

  const { currentUser } = useUser()

  // Add debugging to track wallet connection status
  console.log('Current User State:', currentUser)

  useEffect(() => {

    if (currentUser && currentUser.address) {

      console.log('Wallet connected, address:', currentUser.address)
      console.log('Fetching memories for address:', currentUser.address)
      

      // Pass the user's address to getMemories to filter properly
      getMemories(currentUser.address)
        .then((res) => {
          console.log('Memories fetched:', res)
          setMemories(res)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Error fetching memories:', err)
          setLoading(false)
        })
    } else {

      setLoading(false)
    }

  }, [currentUser]); // This will re-run when currentUser changes


  if (!currentUser || !currentUser.address) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center mt-8">
        <h2 className="text-xl font-semibold text-blue-700">Connect Your Wallet</h2>
        <p className="mt-2 text-blue-600">
          Connect your wallet to view your memories and create new ones.
        </p>
      </div>
    )
  }

  if (loading) return <div>Loading memories...</div>

  if (memories.length === 0) {
    return (
      <div className="p-6 text-center bg-yellow-50 border border-yellow-200 rounded-md mt-4">
        <h3 className="text-lg font-medium text-yellow-700">No Memories Found</h3>
        <p className="text-yellow-600 mt-2">
          Your wallet is connected, but you haven't created any memories yet.
        </p>
      </div>
    )
  }

  return (
    <div>


      <h2 className="text-2xl font-bold mb-4">Your Memories</h2>
      <div className="memory-grid grid gap-4">
        {memories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
      </div>
    </div>
  )
}