// src/components/memory/MemoryCapsuleCreate.jsx
import React, { useState } from 'react'
import { uploadToIPFS } from '../../services/ipfs'

function MemoryCapsuleCreate() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      const results = await uploadToIPFS(files)
      console.log('Upload successful:', results)
      
      setTitle('')
      setDescription('')
      setFiles([])
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 glass-effect rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Create Memory Capsule</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-2 h-24"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload Files</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full border rounded-lg p-2"
            multiple
            accept="image/*,video/*,audio/*"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !files.length}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? 'Creating Memory...' : 'Create Memory'}
        </button>
      </form>
    </div>
  )
}

export default MemoryCapsuleCreate