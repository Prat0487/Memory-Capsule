import express from 'express';
import multer from 'multer';
import axios from 'axios';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const generateNarrative = async (description) => {
  try {
    console.log(`Requesting narrative from AI service for description: "${description.substring(0, 30)}..."`);
    
    // Direct HTTP call to the AI service
    const aiResponse = await axios.post('http://ai-service:3001/api/generate-narrative', {
      description
    }, { 
      timeout: 10000 
    });
    
    console.log('AI service response:', aiResponse.data);
    return aiResponse.data.narrative || '';
  } catch (error) {
    console.error('Failed to generate narrative:', error.message);
    return '';
  }
};

/**
 * Updates a memory's image hash
 * @param {string} memoryId - ID of memory to update
 * @param {string} newIpfsHash - New IPFS hash for enhanced image
 * @returns {Promise<boolean>} - Success status
 */
const updateMemoryImage = async (req, res) => {
  try {
    const { memoryId, ipfsHash } = req.body;
    
    if (!memoryId || !ipfsHash) {
      return res.status(400).json({
         success: false,
         message: 'Memory ID and IPFS hash are required'
       });
    }
    
    // Update the memory in the database
    const result = await db.query(
      'UPDATE memories SET ipfsHash = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [ipfsHash, memoryId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
         success: false,
         message: 'Memory not found'
       });
    }
    
    res.status(200).json({
      success: true,
      memory: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating memory image:', error);
    res.status(500).json({
       success: false,
       message: 'Failed to update memory image'
     });
  }
};
  const enhanceImage = async (description, ipfsHash) => {
    try {
      console.log(`Requesting image enhancement for hash: ${ipfsHash}`);
    
      // Direct HTTP call to the AI service - using service name, not localhost
      const aiResponse = await axios.post('http://ai-service:3001/api/enhance-image', {
        description,
        ipfsHash
      }, { 
        timeout: 30000  // Longer timeout for image processing
      });
    
      console.log('AI service response:', aiResponse.data);
      return aiResponse.data.enhancedImageHash || ipfsHash;
    } catch (error) {
      console.error('Failed to enhance image:', error.message);
      return ipfsHash;  // Return original hash on failure
    }
  };

  router.post('/memories', async (req, res) => {
    try {
      // Extract data from request
      const { title, description, ipfsHash, enhanceImage, ...otherData } = req.body;
    
      // First generate narrative - keep your existing code
      const narrative = await generateNarrative(description);
    
      // Handle image enhancement if requested
      let finalIpfsHash = ipfsHash;
      let metadata = {};
    
      if (enhanceImage && ipfsHash) {
        const enhancedHash = await enhanceImage(description, ipfsHash);
        if (enhancedHash !== ipfsHash) {
          finalIpfsHash = enhancedHash;
          metadata.originalHash = ipfsHash;
        }
      }
    
      // Create the memory with narrative and possibly enhanced image
      const newMemory = await db.query(
        'INSERT INTO memories (title, description, ipfsHash, narrative, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, description, finalIpfsHash, narrative, metadata]
      );
    
      res.status(201).json({
        success: true,
        memory: newMemory.rows[0]
      });
    
    } catch (error) {
      console.error('Error creating memory:', error);
      res.status(500).json({ success: false, error: 'Failed to create memory' });
    }
  });
// Add a new endpoint to get a memory by its ID for public sharing
router.get('/api/memories/shared/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the memory from your storage (Supabase, blockchain mock, etc.)
    const memory = await getMemoryById(id);
    
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    
    // Return only public-safe information
    return res.status(200).json({
      id: memory.id,
      title: memory.title,
      description: memory.description,
      files: memory.files,
      createdAt: memory.createdAt,
      // Don't include owner wallet address or sensitive data
    });
  } catch (error) {
    console.error('Error fetching shared memory:', error);
    return res.status(500).json({ error: 'Failed to retrieve memory' });
  }
});

router.post('/update-image', updateMemoryImage);

export default router;