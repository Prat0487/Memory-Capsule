import express from 'express';
import { trackMemoryShare } from '../index.js';

const router = express.Router();

router.post('/track-share', async (req, res) => {
  try {
    const { memoryId, platform } = req.body;
    
    if (!memoryId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Memory ID is required' 
      });
    }
    
    console.log(`Tracking share: Memory ${memoryId} shared on ${platform || 'unknown platform'}`);
    
    // Call the actual tracking function
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
    console.error('Error tracking share:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

export default router;