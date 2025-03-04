export const environment = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'memory-capsule-452713',
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'C:/GitRepo/Memory-Capsule/vertex-ai-key.json',
    location: process.env.VERTEX_LOCATION || 'us-central1',
    apiEndpoint: process.env.VERTEX_ENDPOINT || 'us-central1-aiplatform.googleapis.com',
    modelName: process.env.VERTEX_MODEL || 'gemini-1.5-pro',
    maxRetries: 3,
    timeoutMs: 30000
    // In services/ai-service/src/config/environment.js
  };
  