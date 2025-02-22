// src/services/blockchain.js
// Mock blockchain service for demonstration
const mockMemories = new Map();
let memoryCounter = 0;

export const mintMemoryNFT = async (memoryData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = ++memoryCounter;
      mockMemories.set(id, { id, ...memoryData });
      resolve({ 
        tokenId: id,
        transactionHash: '0x' + Math.random().toString(36).substring(2, 15)
      });
    }, 2000);
  });
};

export const getMemories = async (address) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Array.from(mockMemories.values()));
    }, 1000);
  });
};

export const verifyOwnership = async (tokenId, address) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
};