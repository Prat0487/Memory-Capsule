import React, { useEffect, useState } from 'react'
import { MemoryCard } from './MemoryCard'
import { getMemories } from '../services/blockchain'

export function MemoryGallery() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Fetching memories from Supabase...')

    // Call getMemories without an address to get all memories
    getMemories()
      .then((res) => {
        console.log('Memories fetched:', res)
        setMemories(res)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching memories:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading memories...</div>
  if (memories.length === 0) return <div>No memories yet.</div>

  return (
    <div>
      <h2>Your Memories</h2>
      <div className="memory-grid">
        {memories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
      </div>
    </div>
  )
}