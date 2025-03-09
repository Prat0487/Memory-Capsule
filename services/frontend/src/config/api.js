// Runtime environment variables or defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001';

export const API_CONFIG = {
  memory: API_URL,
  auth: AUTH_URL,
};

console.log('API Configuration:', API_CONFIG);

export default API_CONFIG;
