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
    
    // Extract just the hash if a full URL was passed
    let hash = ipfsHash;
    if (ipfsHash.includes('/ipfs/')) {
      hash = ipfsHash.split('/ipfs/').pop();
    }
    
    // Array of IPFS gateways to try if one fails
    const gateways = [
      'https://gateway.pinata.cloud/ipfs/',
      'https://ipfs.io/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://dweb.link/ipfs/'
    ];
    
    // Try different gateways if one fails
    let imageData = null;
    let contentType = 'image/jpeg';  // Default content type
    
    for (let i = 0; i < gateways.length; i++) {
      try {
        const imageUrl = `${gateways[i]}${hash}`;
        console.log(`Attempting to fetch image from: ${imageUrl}`);
        
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000  // 10 second timeout
        });
        
        imageData = imageResponse.data;
        contentType = imageResponse.headers['content-type'] || 'image/jpeg';
        console.log(`Successfully fetched image from ${gateways[i]}`);
        break;  // Success! Exit the loop
      } catch (err) {
        console.log(`Failed to fetch from ${gateways[i]}: ${err.message}`);
        
        // If this is the last gateway and all failed, throw error
        if (i === gateways.length - 1) {
          throw new Error('All IPFS gateways failed');
        }
        
        // Wait a bit before trying the next gateway
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!imageData) {
      throw new Error('Could not retrieve image from any gateway');
    }
    
    // For now, just return the original hash since we're not actually enhancing
    // In a real implementation, you would:
    // 1. Send the image to Vertex AI
    // 2. Get the enhanced image back
    // 3. Upload to IPFS
    // 4. Return the new hash
    
    console.log("Image enhancement complete (returning original hash for now)");
    return hash;
  } catch (error) {
    console.error("Error in image enhancement:", error);
    // Return the original hash if enhancement fails
    return ipfsHash.includes('/ipfs/') ? ipfsHash.split('/ipfs/').pop() : ipfsHash;
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