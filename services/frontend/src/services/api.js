// Point to the proper service URLs
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001';
const BLOCKCHAIN_URL = import.meta.env.VITE_BLOCKCHAIN_URL || 'http://localhost:3004';


export const fetchMemories = async () => {
  const response = await fetch(`${API_URL}/memories`);
  return response.json();
};
