import React, { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { MemoryService } from '../services/memoryService'

export function MemoryGallery() {
  const { user } = useUser()
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const memoryService = new MemoryService()

  useEffect(() => {
    if (user?.address) {
      loadMemories()
    } else {
      setMemories([])
      setLoading(false)
    }
  }, [user])

  const loadMemories = async () => {
    try {
      setLoading(true)
      const result = await memoryService.getMemories(user.address)
      setMemories(result.memories || [])
    } catch (error) {
      console.error('Failed to load memories:', error)
      setMemories([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center p-8 text-gray-600">
        Please connect your wallet to view memories
      </div>
    )
  }

  if (memories.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600">
        No memories found. Create your first memory!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {memories.map((memory, index) => (
        <div key={index} className="border rounded-lg p-4 shadow-md">
          <img 
            src={`https://gateway.pinata.cloud/ipfs/${memory.ipfsHash}`}
            alt={memory.title}
            className="w-full h-48 object-cover rounded-lg mb-2"
          />
          <h3 className="font-bold">{memory.title}</h3>
          <p className="text-gray-600">{memory.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            IPFS: {memory.ipfsHash.substring(0, 8)}...
          </p>
        </div>
      ))}
    </div>
  )
}