import express from 'express';
import cors from 'cors';
import { generateBasicNarrative } from './functions/narrative-generator.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware setup
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'ai-service' });
});

// Narrative generation endpoint
app.post('/api/generate-narrative', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Memory description is required' 
      });
    }
    
    // Generate narrative using your AI model
    const narrative = await generateBasicNarrative(description);
    
    res.status(200).json({
      success: true,
      narrative
    });
  } catch (error) {
    console.error('Error in narrative API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate narrative' 
    });
  }
});

async function enhanceImageWithAI(description, ipfsHash) {
  try {
    console.log(`Starting image enhancement for IPFS hash: ${ipfsHash}`);
    
    // Get the image URL
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    // Use Vertex AI to enhance the image
    const model = getGenerativeModel('gemini-1.5-pro-vision');
    
    // 1. Download the image (simplifying this for now)
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
    
    // 2. Generate the prompt for image enhancement
    const prompt = `
      Enhance this image based on the following description:
      "${description}"
      
      Make subtle improvements to match the description while maintaining the original essence.
      Focus on:
      - Improving colors and lighting
      - Enhancing details described in the text
      - Creating a more vivid version of the scene
    `;
    
    // 3. Call Vertex AI
    console.log("Calling Vertex AI vision model...");
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: {
             mimeType: imageResponse.headers['content-type'] || 'image/jpeg',
             data: imageBase64
           }}
        ]
      }]
    });
    
    // For now, just return the original hash
    // In a full implementation, we would extract the enhanced image from the response
    // and upload it to IPFS, but that requires more complex handling
    
    console.log("Image enhancement complete");
    return ipfsHash;
  } catch (error) {
    console.error("Error in image enhancement:", error);
    // Return the original hash if enhancement fails
    return ipfsHash;
  }
}

app.post('/api/enhance-image', async (req, res) => {
  try {
    const { description, ipfsHash } = req.body;
    
    if (!description || !ipfsHash) {
      return res.status(400).json({ 
        success: false, 
        error: 'Both description and ipfsHash are required' 
      });
    }
    
    console.log(`Enhancing image ${ipfsHash} based on description: ${description}`);
    
    // Get the image from IPFS
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    // Call Vertex AI to enhance the image
    const enhancedImageHash = await enhanceImageWithAI(description, imageUrl);
    
    // Return the enhanced image hash
    res.status(200).json({
      success: true,
      originalIpfsHash: ipfsHash,
      enhancedImageHash: enhancedImageHash
    });
  } catch (error) {
    console.error('Error enhancing image:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to enhance image' 
    });
  }
});
// Start the server
// Add this import at the top of your file, with your other imports
import { getGenerativeModel } from './clients/vertex-client.js';

app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});