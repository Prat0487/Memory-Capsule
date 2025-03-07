import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import IpfsImage from '../components/IpfsImage';

function SharedMemoryPage() {
  const { id } = useParams();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedMemory = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/shared-memories/${id}`);
        
        if (response.data && response.data.success) {
          setMemory(response.data.memory);
        } else {
          setError('Memory not found');
        }
      } catch (err) {
        console.error('Error fetching shared memory:', err);
        setError('Failed to load shared memory');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSharedMemory();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="mt-4">Loading shared memory...</p>
      </div>
    );
  }
  
  if (error || !memory) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md mx-auto">
          <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">{error || 'Memory not found'}</h2>
          <p className="mb-6 text-gray-600">The shared memory you're looking for might have been removed or is unavailable.</p>
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Return Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {memory.ipfsHash ? (
          <div className="relative">
            <div className="w-full aspect-[16/9] bg-gray-50 overflow-hidden rounded-t-xl">
              <IpfsImage 
                hash={memory.ipfsHash} 
                alt={memory.title || "Shared memory image"}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[16/9] bg-gray-100 flex items-center justify-center rounded-t-xl">
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900">{memory.title}</h1>
          <p className="text-gray-600 mt-1">
            Created: {memory.createdAt 
              ? new Date(memory.createdAt).toLocaleDateString() 
              : memory.created_at 
                ? new Date(memory.created_at).toLocaleDateString()
                : "Date unavailable"}
          </p>
          
          <div className="prose max-w-none mt-6">
            <p className="text-lg">{memory.description}</p>
          </div>
          
          {memory.narrative && (
            <div className="mt-6 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Memory Narrative</h3>
              <p className="text-gray-800 italic">{memory.narrative}</p>
            </div>
          )}
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              This is a shared memory from Memory Capsule. To create your own memories, sign up for an account.
            </p>
            <div className="mt-4">
              <Link to="/signup" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-4">
                Sign Up
              </Link>
              <Link to="/login" className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharedMemoryPage;
