import React, { useState } from 'react'
import ipfs from '../utils/ipfs'

function UploadMemory() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('idle')
  const [ipfsHash, setIpfsHash] = useState('')

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const uploadToIPFS = async () => {
    if (!selectedFile) return

    setUploadStatus('uploading')
    try {
      const added = await ipfs.add(selectedFile)
      setIpfsHash(added.path)
      setUploadStatus('uploaded')
    } catch (error) {
      console.error('IPFS upload error:', error)
      setUploadStatus('error')
    }
  }

  return (
    <div className="max-w-md w-full mx-auto my-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Upload Memory</h2>

      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer
                   bg-gray-50 hover:bg-gray-100 focus:outline-none p-2"
        accept="image/*,audio/*,text/plain"
      />

      <button
        className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md font-semibold
                   hover:bg-indigo-700 transition-colors duration-200"
        onClick={uploadToIPFS}
      >
        Upload
      </button>

      {uploadStatus === 'uploading' && (
        <p className="mt-2 text-blue-600 font-medium animate-pulse">Uploading...</p>
      )}

      {uploadStatus === 'uploaded' && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 font-medium">File uploaded successfully!</p>
          <p className="text-gray-600 break-all">
            IPFS Hash: <span className="font-mono">{ipfsHash}</span>
          </p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <p className="mt-2 text-red-600 font-semibold">Upload failed. Please try again.</p>
      )}
    </div>
  )
}

export default UploadMemory