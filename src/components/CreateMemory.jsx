import React, { useState } from 'react'
import { useUser } from '../context/UserContext'
import { MemoryService } from '../services/memoryService'

export function CreateMemory() {
  const { user } = useUser()
  const [files, setFiles] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  
  const memoryService = new MemoryService()

  const handleFileChange = (e) => {
    // Convert FileList to Array
    setFiles(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const memory = await memoryService.createMemory(files, {
        title,
        description,
        ownerAddress: user.address
      })
      
      // Clear form
      setFiles([])
      setTitle('')
      setDescription('')
      
      console.log('Memory created:', memory)
    } catch (error) {
      console.error('Failed to create memory:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Files</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full"
          accept="image/*,audio/*,text/plain"
          multiple
          required
        />
        {files.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Selected files: {files.length}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        disabled={loading || files.length === 0}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Memory'}
      </button>
    </form>
  )
}