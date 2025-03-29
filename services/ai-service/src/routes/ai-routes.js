import express from 'express';
import { generateBasicNarrative } from '../functions/narrative-generator.js';

const router = express.Router();

router.post('/api/generate-narrative', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ 
        error: 'Description is required for narrative generation' 
      });
    }
    
    console.log(`AI Service received narrative request for: "${description.substring(0, 30)}..."`);
    const narrative = await generateBasicNarrative(description);
    
    console.log(`Generated narrative: "${narrative.substring(0, 50)}..."`);
    return res.json({ narrative });
  } catch (error) {
    console.error('Narrative generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate narrative',
      message: error.message 
    });
  }
});

export default router;
