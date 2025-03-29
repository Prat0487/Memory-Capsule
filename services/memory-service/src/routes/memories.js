import express from 'express';
import db from '../db.js';
const { query } = db;
import axios from 'axios';

// Create a router
const router = express.Router();

// Your existing updateMemoryImage function
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

// Add enhance memory function
const enhanceMemoryImage = async (req, res) => {
  try {
    const { memoryId, ipfsHash, description } = req.body;
    
    console.log(`Enhancing memory: ${memoryId}, hash: ${ipfsHash}`);
    
    // Call AI service for enhancement
    const aiResponse = await axios.post('http://ai-service:3003/api/enhance-image', {
      ipfsHash,
      description
    });
    
    console.log('AI response:', aiResponse.data);
    
    // Get enhanced hash
    const enhancedHash = aiResponse.data.enhancedIpfsHash;
    const enhancedUrl = `https://gateway.pinata.cloud/ipfs/${enhancedHash}`;
    
    // Update database
    const result = await db.query(
      `UPDATE memories 
       SET enhanced_image_hash = $1, 
           enhanced_image_url = $2,
           is_local_enhancement = false,
           updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [enhancedHash, enhancedUrl, memoryId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Memory not found' });
    }
    
    return res.status(200).json({
      success: true,
      memory: result.rows[0]
    });
  } catch (error) {
    console.error('Enhancement error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Register routes
router.post('/update-memory-image', updateMemoryImage);
router.post('/enhance-memory-image', enhanceMemoryImage);

// Export the router
export default router;