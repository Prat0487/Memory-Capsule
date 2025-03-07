// In your createMemory method of MemoryService class
createMemory = async (files, metadata) => {
  // Debug what's being sent
  console.log('Preparing request with:', { metadata, files: files.length })
  
  // Create FormData object
  const formData = new FormData()
  
  // Add all metadata as fields
  for (const [key, value] of Object.entries(metadata)) {
    formData.append(key, value)
    console.log(`Adding field ${key}:`, value)
  }
  
  // Add files if any exist
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
      console.log(`Adding file ${i}:`, files[i].name)
    }
  }
  
  // Show in browser what's being sent
  console.log('FormData entries:')
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1])
  }
  
  // Make the actual request
  return axios.post('http://localhost:3000/memories/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  })
}

import axios from 'axios';

// Set up axios interceptor to include auth token in requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchMemoryById = async (id) => {
  try {
    const address = localStorage.getItem('userAddress') || '0x69592f057c1Fd4D1a82758D91acAf5D37d2639F8';
    const response = await axios.get(`http://localhost:3000/memories/${address}`);
    
    if (response.data && response.data.success && response.data.memories) {
      const memory = response.data.memories.find(m => m.id == id);
      
      // Debug log to check what's coming back
      console.log("Memory data:", memory);
      
      if (memory) {
        return memory;
      }
      throw new Error('Memory not found');
    }
    throw new Error('Failed to fetch memories');
  } catch (error) {
    console.error('Error fetching memory:', error);
    throw error;
  }
};