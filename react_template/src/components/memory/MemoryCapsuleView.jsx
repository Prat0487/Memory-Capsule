// src/components/memory/MemoryCapsuleView.jsx
import React, { useState, useEffect } from 'react';
import MemoryCard from './MemoryCard';
import { useUser } from '../../context/UserContext';
import { getMemories } from '../../services/blockchain';

function MemoryCapsuleView() {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const loadMemories = async () => {
      if (user) {
        try {
          const userMemories = await getMemories(user.address);
          setMemories(userMemories);
        } catch (error) {
          console.error('Failed to load memories:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMemories();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Your Memory Capsules</h2>
      {memories.length === 0 ? (
        <p className="text-gray-500 text-center">No memories found. Create your first memory capsule!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MemoryCapsuleView;