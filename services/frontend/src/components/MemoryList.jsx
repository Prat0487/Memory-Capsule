import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EnhancedMemoryImage from './EnhancedMemoryImage';

const MemoryList = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMemories();
  }, []);
  
  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/blockchain/memories');
      setMemories(response.data);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnhanceComplete = (updatedMemory) => {
    setMemories(prevMemories => 
      prevMemories.map(memory => 
        memory.id === updatedMemory.id ? updatedMemory : memory
      )
    );
  };
  
  if (loading) {
    return <div className="text-center py-10">Loading memories...</div>;
  }
  
  if (memories.length === 0) {
    return <div className="text-center py-10">No memories found. Create your first memory!</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {memories.map(memory => (
        <div key={memory.id} className="bg-white rounded-2xl shadow-soft p-4">
          <EnhancedMemoryImage 
            memory={memory} 
            onEnhanceComplete={handleEnhanceComplete} 
          />
          <h3 className="text-xl font-semibold mt-3">{memory.title}</h3>
          <p className="text-gray-600 mt-2">{memory.description}</p>
          <div className="text-sm text-gray-500 mt-3">
            Created on {new Date(memory.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoryList;
