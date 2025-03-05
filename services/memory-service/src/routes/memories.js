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
      'UPDATE memories SET ipfs_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
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

router.post('/memories/create', upload.array('files'), async (req, res) => {
    try {
      // Extracting and logging all request fields
      console.log('Request fields:', req.body);
    
      let narrativeText = '';
      let memoryData;

      // Check if narrative generation is requested
      if (req.body.generateNarrative === 'true') {
        console.log('Narrative generation requested - generating narrative');
      
        try {
          // Option 1: Call your AI service if it's available
          const aiResponse = await axios.post('http://ai-service:3001/api/generate-narrative', {
            description: req.body.description
          }, { timeout: 5000 });
        
          if (aiResponse?.data?.narrative) {
            // Use the AI-generated narrative
            narrativeText = aiResponse.data.narrative;
            console.log('AI narrative generated:', narrativeText.substring(0, 30) + '...');
          } else {
            // Fallback to template narratives if AI service returns empty
            throw new Error('AI service returned empty narrative');
          }
        } catch (error) {
          console.log('AI service unavailable, using template narrative instead:', error.message);
        
          // Option 2: Generate a simple narrative if AI service fails
          const narratives = [
            "This captured moment represents more than just an image - it embodies the emotions, connections, and unique experiences that shape your personal journey.",
            "Some moments deserve to be treasured forever. This memory, preserved in your digital time capsule, will remain a beacon of that special feeling.",
            "The power of memory lies in its ability to transcend time, bringing emotions and connections back to life whenever you revisit this preserved moment."
          ];
        
          // Select a narrative based on description content
          const seed = req.body.description.length;
          narrativeText = narratives[seed % narratives.length];
          console.log('Template narrative generated:', narrativeText.substring(0, 30) + '...');
        }
      
        // Now include the narrative in the memory data
        memoryData = {
          title: req.body.title,
          description: req.body.description,
          ipfsHash: uploadResult.IpfsHash,
          url: `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`,
          ownerAddress: req.body.owner,
          created_at: new Date().toISOString(),
          type: 'standard',
          sharecount: 0,
          narrative: narrativeText  // Use the generated narrative
        };
      } else {
        // No narrative generation requested, create memory object with empty narrative
        memoryData = {
          title: req.body.title,
          description: req.body.description,
          ipfsHash: uploadResult.IpfsHash,
          url: `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`,
          ownerAddress: req.body.owner,
          created_at: new Date().toISOString(),
          type: 'standard',
          sharecount: 0,
          narrative: ''
        };
      }

      // Then continue with your Supabase insert
      const { data, error } = await supabase.from('memories').insert([memoryData]).select();
    
      if (error) {
        // Your error handling
      }
    
      // Get the newly created memory
      const memory = data[0];
      console.log(`Memory created with ID ${memory.id}`);
    
      // Respond immediately with the created memory
      return res.status(201).json({
        success: true,
        message: 'Memory created successfully',
        memory
      });
    } catch (error) {
      console.error('Memory creation failed:', error);
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred while creating memory'
      });
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