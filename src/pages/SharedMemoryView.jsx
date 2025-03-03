import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';

const SharedMemoryView = () => {
  const { id } = useParams();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSharedMemory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/memories/shared/${id}`);
        setMemory(response.data);
      } catch (err) {
        console.error('Error fetching shared memory:', err);
        setError('This memory could not be loaded or does not exist.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSharedMemory();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">Memory Not Found</h2>
          <p className="text-gray-700">{error}</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <FaArrowLeft className="mr-2" />
        Back to Home
      </Link>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{memory?.title}</h1>
          <p className="text-gray-600 mb-4">Created on {new Date(memory?.createdAt).toLocaleDateString()}</p>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{memory?.description}</p>
          </div>
          
          {memory?.files && memory.files.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h2 className="text-xl font-semibold mb-3">Files</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {memory.files.map((file, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`} 
                        alt={file.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : file.type.startsWith('video/') ? (
                      <video 
                        src={`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`}
                        controls
                        className="w-full h-48 object-cover"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="h-48 flex items-center justify-center bg-gray-100">
                        <a 
                          href={`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {file.name}
                        </a>
                      </div>
                    )}
                    <div className="p-3 border-t">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              This is a shared memory from Memory Capsule. Create your own memories by visiting our website.
            </p>
            <Link
              to="/"
              className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Create Your Memory Capsule
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedMemoryView;
