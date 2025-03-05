import express from 'express';
import { trackMemoryShare } from '../index.js';

const router = express.Router();

// Add this route handler to handle tracking memory shares
router.post('/track-share', async (req, res) => {
  try {
    const { memoryId } = req.body;
    
    if (!memoryId) {
      return res.status(400).json({ error: 'Memory ID is required' });
    }
    
    // Call the existing trackMemoryShare function from index.js
    const success = await trackMemoryShare(memoryId);
    
    if (success) {
      return res.json({ success: true, message: 'Share tracked successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to track share' });
    }
  } catch (error) {
    console.error('Error tracking share:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;