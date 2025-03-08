// Point to the proper service URLs
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001';
const BLOCKCHAIN_URL = import.meta.env.VITE_BLOCKCHAIN_URL || 'http://localhost:3001';

// Memory related API calls
export const fetchMemories = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_URL}/memories`, { headers });
  return response.json();
};

export const fetchMemoryById = async (id, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_URL}/memories/${id}`, { headers });
  return response.json();
};

export const createMemory = async (memoryData, token) => {
  const response = await fetch(`${API_URL}/memories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(memoryData)
  });
  return response.json();
};

export const updateMemory = async (id, memoryData, token) => {
  const response = await fetch(`${API_URL}/memories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(memoryData)
  });
  return response.json();
};

export const deleteMemory = async (id, token) => {
  const response = await fetch(`${API_URL}/memories/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.json();
};

export const shareMemory = async (id, recipientEmail, token) => {
  const response = await fetch(`${API_URL}/memories/${id}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ recipientEmail })
  });
  return response.json();
};

// Authentication related API calls
export const loginUser = async (email, password) => {
  const response = await fetch(`${AUTH_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

export const registerUser = async (email, password) => {
  const response = await fetch(`${AUTH_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

export const connectUserWallet = async (email, walletAddress, token) => {
  const response = await fetch(`${AUTH_URL}/auth/connect-wallet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ email, walletAddress })
  });
  return response.json();
};

// File upload related API calls
export const uploadImage = async (formData, token) => {
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  return response.json();
};

// IPFS related API calls
export const pinToIPFS = async (data, token) => {
  const response = await fetch(`${BLOCKCHAIN_URL}/ipfs/pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// AI service related calls
export const generateNarrative = async (imageUrl, token) => {
  const response = await fetch(`${API_URL}/ai/generate-narrative`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ imageUrl })
  });
  return response.json();
};
