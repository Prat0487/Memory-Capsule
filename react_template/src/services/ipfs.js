// src/services/ipfs.js
// Mock IPFS service for demonstration
const mockIPFSHashes = new Map();

export const uploadToIPFS = async (file) => {
  return new Promise((resolve) => {
    // Simulate file upload delay
    setTimeout(() => {
      // Generate a mock IPFS hash
      const hash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      mockIPFSHashes.set(hash, file);
      resolve(hash);
    }, 1000);
  });
};

export const retrieveFromIPFS = async (hash) => {
  return new Promise((resolve, reject) => {
    const file = mockIPFSHashes.get(hash);
    if (file) {
      resolve(file);
    } else {
      reject(new Error('File not found'));
    }
  });
};

export const pinContent = async (hash) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, hash });
    }, 500);
  });
};