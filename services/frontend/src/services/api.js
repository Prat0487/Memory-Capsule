// Point to the proper service URLs
const API_URL = import.meta.env.VITE_API_URL || '/api';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || '/auth';

export const fetchMemories = async () => {
  const response = await fetch(`${API_URL}/memories`);
  return response.json();
};
