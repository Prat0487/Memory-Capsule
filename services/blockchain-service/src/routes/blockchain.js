import express from 'express';
import { trackMemoryShare } from '../index.js';

const router = express.Router();

// Endpoint to track memory shares
router.post('/api/blockchain/track-share', async (req, res) => {
  try {
    const { memoryId } = req.body;
    
    if (!memoryId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Memory ID is required' 
      });
    }
    
    const success = await trackMemoryShare(memoryId);
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Share tracked successfully' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to track share' 
      });
    }
  } catch (error) {
    console.error('Error in track-share endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

import { updateMemoryWithEnhancedImage } from '../index.js';
import axios from 'axios';

// Add this endpoint to your router
router.post('/api/blockchain/enhance-memory-image', async (req, res) => {
  try {
    const { memoryId, ipfsHash, description } = req.body;
    
    if (!memoryId || !ipfsHash || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Memory ID, IPFS hash, and description are required' 
      });
    }
    
    // Call the AI service to enhance the image
    const aiServiceResponse = await axios.post(
      'http://ai-service:3005/api/enhance-image',
      {
        ipfsHash,
        description
      }
    );
    
    if (!aiServiceResponse.data.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to enhance image'
      });
    }
    
    // Get the enhanced image hash
    const enhancedImageHash = aiServiceResponse.data.enhancedIpfsHash;
    
    // Update the memory with the enhanced image hash
    const updatedMemory = await updateMemoryWithEnhancedImage(memoryId, enhancedImageHash);
    
    return res.status(200).json({
      success: true,
      memory: updatedMemory,
      enhancedImageHash
    });
  } catch (error) {
    console.error('Error enhancing memory image:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to enhance and update memory image'
    });
  }
});

export default router;
