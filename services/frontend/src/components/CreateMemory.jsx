import React, { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { MemoryService } from '../services/memoryService'

export function CreateMemory({ onMemoryCreated }) {
  const { currentUser, connectWallet } = useUser()
  const [files, setFiles] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingSubmission, setPendingSubmission] = useState(false)
  
  const memoryService = new MemoryService()
    const handleFileChange = (e) => {
      setFiles(Array.from(e.target.files))
    }

    useEffect(() => {
      if (pendingSubmission && currentUser?.address) {
        console.log('Wallet now connected, continuing with memory creation...')
        createMemory()
        setPendingSubmission(false)
      }
    }, [currentUser, pendingSubmission])

    const createMemory = async () => {
      if (!currentUser?.address) return
    
      setLoading(true)
    
      try {
        // Ensure memoryService is properly configured to send all form data
        const memoryData = {
          title,
          description,
          ownerAddress: currentUser.address,
          date: new Date().toISOString(),
          // Any other fields you need to include
        }
      
        console.log('Sending memory data:', memoryData)
      
        const memory = await memoryService.createMemory(files, memoryData)
      
        setFiles([])
        setTitle('')
        setDescription('')
        onMemoryCreated()
      
        console.log('Memory created:', memory)
      } catch (error) {
        console.error('Failed to create memory:', error)
      } finally {
        setLoading(false)
      }
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
    
      if (!currentUser?.address) {
        console.log('No wallet connected, marking submission as pending and connecting wallet')
        setPendingSubmission(true)
        await connectWallet()
        return
      }
    
      // Add validation and logging before submission
      console.log('Submitting form with data:', {
        title,
        description,
        files: files.length > 0 ? `${files.length} files selected` : 'No files'
      })
    
      createMemory()
    }
    e.preventDefault()
    
    if (!currentUser?.address) {
      console.log('No wallet connected, marking submission as pending and connecting wallet')
      setPendingSubmission(true)
      await connectWallet()
      return
    }
    
    createMemory()
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
        {!currentUser ? 'Connect Wallet' : loading ? 'Creating...' : 'Create Memory'}
      </button>
    </form>
  )
}