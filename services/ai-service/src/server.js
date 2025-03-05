  const express = require('express');
  const cors = require('cors');
  const { generateNarrative } = require('./functions/narrative-generator');
  const { enhanceImageWithAI } = require('./functions/image-enhancer');

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Generate narrative endpoint
  app.post('/api/generate-narrative', async (req, res) => {
    try {
      const { description } = req.body;
      const narrative = await generateNarrative(description);
      res.json({ narrative });
    } catch (error) {
      console.error('Error generating narrative:', error);
      res.status(500).json({ error: 'Failed to generate narrative' });
    }
  });

  // Add new image enhancement endpoint
  app.post('/api/enhance-image', async (req, res) => {
    try {
      const { description, ipfsHash } = req.body;
    
      if (!description || !ipfsHash) {
        return res.status(400).json({ 
          success: false, 
          error: 'Both description and ipfsHash are required' 
        });
      }
    
      const enhancedImageHash = await enhanceImageWithAI(description, ipfsHash);
    
      res.status(200).json({
        success: true,
        originalHash: ipfsHash,
        enhancedImageHash: enhancedImageHash
      });
    } catch (error) {
      console.error('Error enhancing image:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to enhance image',
        originalHash: req.body.ipfsHash
      });
    }
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`AI service running on port ${PORT}`);
  });
