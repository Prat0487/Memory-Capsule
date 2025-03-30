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

// Register routes
router.post('/update-memory-image', updateMemoryImage);

// Export the router
export default router;