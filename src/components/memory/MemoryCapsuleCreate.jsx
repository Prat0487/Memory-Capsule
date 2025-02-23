// src/components/memory/MemoryCapsuleCreate.jsx
import React, { useState } from 'react';
import { uploadToIPFS } from '../../services/ipfs';
import { generateNarrative } from '../../services/ai';
import { mintMemoryNFT } from '../../services/blockchain';

function MemoryCapsuleCreate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload files to IPFS
      const ipfsHashes = await Promise.all(files.map(file => uploadToIPFS(file)));
      
      // Generate AI narrative
      const narrative = await generateNarrative(description, files);
      
      // Create memory NFT
      const memoryData = {
        title,
        description,
        narrative,
        ipfsHashes,
        timestamp: new Date().toISOString()
      };
      
      await mintMemoryNFT(memoryData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setFiles([]);
      
      alert('Memory capsule created successfully!');
    } catch (error) {
      console.error('Failed to create memory:', error);
      alert('Failed to create memory capsule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 space-y-6">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-32"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Media Files
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          multiple
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          accept="image/*,video/*,audio/*"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
      >
        {isLoading ? 'Creating Memory...' : 'Create Memory Capsule'}
      </button>
    </form>
  );
}

export default MemoryCapsuleCreate;