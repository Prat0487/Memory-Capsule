import { VertexAI } from '@google-cloud/vertexai';
import { environment } from '../config/environment.js';

// Create singleton for Vertex client
let vertexInstance = null;

export const getVertexClient = () => {
  if (!vertexInstance) {
    vertexInstance = new VertexAI({
      project: environment.projectId,
      location: environment.location,
      apiEndpoint: environment.apiEndpoint,
      keyFilename: environment.keyFilename
    });
  }
  
  return vertexInstance;
};

export const getGenerativeModel = (modelName = environment.modelName) => {
  const vertex = getVertexClient();
  return vertex.preview.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 256,
      temperature: 0.4,
      topP: 0.8,
      topK: 40
    }
  });
};
