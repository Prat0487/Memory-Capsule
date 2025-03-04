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

router.post('/memories/create', upload.array('files'), async (req, res) => {
  try {
    // Extracting and logging all request fields
    console.log('Request fields:', req.body);
    
    // Create the initial memory record - your existing code
    const { data, error } = await supabase.from('memories').insert([{
      title: req.body.title,
      description: req.body.description,
      // other fields...
    }]).select();
    
    if (error) {
      // Your error handling
    }
    
    // Get the newly created memory
    const memory = data[0];
    console.log(`Memory created with ID ${memory.id}`);
    
    // Always attempt narrative generation if we have a description
    if (req.body.description && req.body.description.length > 10) {
      console.log('Description meets minimum length for narrative generation');
      
      // Generate narrative in background 
      setTimeout(async () => {
        try {
          console.log(`Starting background narrative generation for memory ${memory.id}`);
          const narrative = await generateNarrative(req.body.description);
          
          if (narrative) {
            console.log(`Updating memory ${memory.id} with generated narrative`);
            const { error: updateError } = await supabase
              .from('memories')
              .update({ narrative })
              .eq('id', memory.id);
              
            if (updateError) {
              console.error('Failed to update memory with narrative:', updateError);
            } else {
              console.log(`Successfully updated memory ${memory.id} with narrative`);
            }
          }
        } catch (e) {
          console.error('Background narrative processing error:', e);
        }
      }, 100); // Small delay to ensure response is sent first
    }
    
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

export default router;
