# Vertex AI Integration Setup Guide

This document outlines the complete setup process for integrating Google's Vertex AI with the Memory Capsule platform.

## 1. Prerequisites

- Google Cloud account with billing enabled
- Project created in Google Cloud Console (memory-capsule-452713)
- Node.js environment with npm

## 2. Google Cloud SDK Installation

The Google Cloud SDK provides command-line tools for managing Google Cloud resources:

```bash
# Download the Google Cloud SDK installer
curl https://sdk.cloud.google.com | bash

# Accept the default installation directory when prompted
# /c/Users/<username>

# Add the SDK to your PATH (if not done automatically)
# Add C:\Users\<username>\google-cloud-sdk\bin to your PATH

# Verify installation
gcloud --version
```

## 3. Google Cloud Authentication

```bash
# Authenticate with Google Cloud
gcloud auth login

# Follow the browser prompts to complete authentication
```

## 4. Service Account Creation

Service accounts provide a secure identity for making API calls:

```bash
# Set the active project
gcloud config set project memory-capsule-452713

# Create a service account for the AI operations
gcloud iam service-accounts create memory-ai-service \
  --description="Service account for Memory Capsule AI" \
  --display-name="Memory AI Service"

# Generate and download service account key
gcloud iam service-accounts keys create ./vertex-ai-key.json \
  --iam-account=memory-ai-service@memory-capsule-452713.iam.gserviceaccount.com
```

## 5. Enable Required APIs

```bash
# Enable the Vertex AI API
gcloud services enable aiplatform.googleapis.com
```

## 6. Environment Configuration

Created an environment configuration file to centralize Vertex AI settings:

```javascript
// File: services/ai-service/src/config/environment.js
export const environment = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'memory-capsule-452713',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './vertex-ai-key.json',
  location: process.env.VERTEX_LOCATION || 'us-central1',
  apiEndpoint: process.env.VERTEX_ENDPOINT || 'us-central1-aiplatform.googleapis.com',
  modelName: process.env.VERTEX_MODEL || 'gemini-1.5-pro',
  maxRetries: 3,
  timeoutMs: 30000
};
```

## 7. Vertex Client Implementation

Created a client module using the singleton pattern for efficiency:

```javascript
// File: services/ai-service/src/clients/vertex-client.js
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
```

## 8. Package Installation

Installed required Node.js packages:

```bash
# Navigate to AI service directory
cd services/ai-service

# Install Vertex AI client library
npm install @google-cloud/vertexai

# Install other dependencies
npm install express cors
```

## 9. Security Considerations

- The service account key file (vertex-ai-key.json) contains sensitive credentials and should never be committed to version control
- Added vertex-ai-key.json to .gitignore
- For production, use environment variables or secret management systems rather than local key files

## 10. Next Steps

- Implement prompt templates
- Create narrative generation functions
- Build API endpoints for frontend integration
- Add image analysis capabilities
- Implement caching for performance optimization

## 11. Troubleshooting

- If authentication fails, verify the key file path and permissions
- For "PERMISSION_DENIED" errors, check IAM roles assigned to the service account
- When model doesn't respond, verify API enablement and model availability in your region
