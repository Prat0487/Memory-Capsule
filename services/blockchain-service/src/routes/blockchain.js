import express from 'express';
import { trackMemoryShare } from '../index.js';

const router = express.Router();

// Endpoint to track memory shares - temporarily disabled due to 404 errors

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


// If you want to enable this later, change the route to:
// router.post('/track-share', async (req, res) => { ... });
// And make sure the router is mounted at '/api/blockchain' in your main server file

export default router;