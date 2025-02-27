import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMemoryById } from '../services/blockchain';

function SharedMemoryView() {
  const { id } = useParams();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        console.log("Fetching memory with ID:", id);
        const memoryData = await getMemoryById(id);
        
        console.log("Retrieved memory data:", memoryData);
        if (memoryData) {
          setMemory(memoryData);
        } else {
          setError("Memory not found");
        }
      } catch (err) {
        console.error("Error fetching memory:", err);
        setError("Error loading memory");
      } finally {
        setLoading(false);
      }
    };

    fetchMemory();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Loading memory...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!memory) return <div className="p-4 text-center">Memory not found</div>;

  // Function to render memory content appropriately
  const renderMemoryContent = () => {
    if (memory.files && memory.files.length > 0) {
      return memory.files.map((file, index) => (
        <div key={index} className="mb-4">
          {file.type?.startsWith('image/') ? (
            <img 
              src={file.url} 
              alt={file.name || "Memory image"} 
              className="max-w-full rounded-lg shadow-md mx-auto" 
            />
          ) : (
            <a href={file.url} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
              {file.name || "View attachment"}
            </a>
          )}
        </div>
      ));
    } else if (memory.ipfsHash) {
      return (
        <img 
          src={`https://gateway.pinata.cloud/ipfs/${memory.ipfsHash}`} 
          alt="Memory" 
          className="max-w-full rounded-lg shadow-md mx-auto" 
        />
      );
    }
    
    return <p className="text-gray-500 italic">No media attached to this memory</p>;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-2">{memory.title}</h1>
      <p className="text-gray-700 mb-6">{memory.description}</p>
      
      <div className="memory-content">
        {renderMemoryContent()}
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        Created on {new Date(memory.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

export default SharedMemoryView;