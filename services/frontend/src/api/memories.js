import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000';

export const createMemory = async (memoryData) => {
  try {
    const response = await axios.post(`${API_URL}/memories/create`, memoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating memory:', error);
    throw error;
  }
};

export const getMemories = async (address) => {
  try {
    const response = await axios.get(`${API_URL}/memories/${address}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
};
