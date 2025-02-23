// src/services/ai.js
// Mock AI service for demonstration
export const generateNarrative = async (description, files) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock AI-generated narrative based on description and files
      const narratives = [
        "A cherished moment frozen in time, capturing the essence of joy and connection.",
        "This memory speaks of adventure and discovery, painting a vivid picture of life's journey.",
        "A beautiful snapshot of relationships and shared experiences that define our story."
      ];
      
      resolve(narratives[Math.floor(Math.random() * narratives.length)]);
    }, 1500);
  });
};

export const enhanceImage = async (imageFile) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock image enhancement
      resolve(imageFile);
    }, 1000);
  });
};