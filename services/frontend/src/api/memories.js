import { API_CONFIG } from '../config/api';

export const createMemory = async (memoryData) => {
  try {
    const response = await fetch(`${API_CONFIG.memory}/memories/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memoryData),
    });
    return response.json();
  } catch (error) {
    console.error('Error creating memory:', error);
    throw error;
  }
};

export const getMemories = async (address) => {
  try {
    const response = await fetch(`${API_CONFIG.memory}/memories/${address}`);
    return response.json();
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
};

export const fetchMemories = async () => {
  const response = await fetch(`${API_CONFIG.memory}/memories`);
  return response.json();
};
