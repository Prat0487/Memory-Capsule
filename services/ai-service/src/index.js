import express from 'express';
import cors from 'cors';
import { generateBasicNarrative } from './functions/narrative-generator.js';

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

app.post('/api/enhance-image', async (req, res) => {
  try {
    const { description, ipfsHash } = req.body;
    
    if (!description || !ipfsHash) {
      return res.status(400).json({ 
        success: false, 
        error: 'Both description and ipfsHash are required' 
      });
    }
    
    // Call your AI model to enhance the image
    // This is a placeholder - implement your actual enhancement logic
    console.log(`Enhancing image ${ipfsHash} based on description: ${description}`);
    
    // For now, just return the same hash (no enhancement)
    // In a real implementation, you would generate a new image and upload to IPFS
    const enhancedImageHash = ipfsHash;
    
    res.status(200).json({
      success: true,
      enhancedImageHash,
      originalHash: ipfsHash
    });
  } catch (error) {
    console.error('Error in image enhancement API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to enhance image' 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});