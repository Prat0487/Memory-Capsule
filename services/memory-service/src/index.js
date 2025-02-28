import express from 'express';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// For Node.js versions that don't have global fetch
global.fetch = fetch;

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Supabase initialization with custom fetch
const supabaseUrl = 'https://lsijhlxvtztpjdvyjnwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWpobHh2dHp0cGpkdnlqbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjkyNjMsImV4cCI6MjA1NjAwNTI2M30.cyoRUValV1tW4JpnW8A-5NPJ4luVjybhj8RjaZQ4_rI';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: fetch
  }
});
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Update your endpoint to use multer
app.post('/memories/create', upload.array('files'), async (req, res) => {
  try {
    console.log('Request fields:', req.body);
    console.log('Uploaded files:', req.files ? req.files.length : 'none');
    
    const { title, description, date, ownerAddress } = req.body;
    const files = req.files || [];
    
    // Now you can access all fields from req.body and files from req.files
    
    // Process files and continue with your existing logic...
    let storageResponse;
    let ipfsHash = null;
    let fileUrls = [];
    
    if (files.length > 0) {
      try {
        // Modify how you send files to the IPFS service
        storageResponse = await axios.post('http://ipfs-service:3002/upload', { 
          files: files.map(file => ({
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype
          }))
        });
        ipfsHash = storageResponse.data.ipfsHash;
        fileUrls = storageResponse.data.fileUrls;
      } catch (uploadError) {
        console.error("File upload error:", uploadError.message);
      }
    }
    
    // Add this before your database insert
    if (!ipfsHash) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: ipfsHash',
        details: 'A valid IPFS hash is required for memory creation'
      });
    }

    // 3. Store in database with proper error handling
    const { data, error } = await supabase
      .from('memories')
      .insert([{ 
        title: title || "Untitled Memory", 
        description: description || "", 
        created_at: date || new Date().toISOString(), 
        ipfsHash: ipfsHash || "placeholder-hash", 
        url: fileUrls || [],  
        ownerAddress: ownerAddress || "anonymous",
        narrative: req.body.narrativeText || ""
      }])
      .select();
      
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    res.status(201).json({
      success: true,
      memory: data[0]
    });
  } catch (error) {
    console.error('Memory creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create memory',
      details: error.message
    });
  }
});app.get('/memories/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const memories = await getMemories(address);
    res.json({ success: true, memories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a memory by coordinating with other services
const createMemory = async (memoryData) => {
  try {
    // Log what's being sent
    console.log("Sending memory data:", memoryData);
    
    // Ensure files are formatted correctly
    const formattedData = {
      ...memoryData,
      files: memoryData.files || [],
      date: memoryData.date || new Date().toISOString()
    };
    
    const response = await axios.post(`${API_URL}/memories/create`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating memory:', error);
    throw error;
  }
};

// Get memories for an address
const getMemories = async (address) => {
  try {
    const response = await axios.get(`http://blockchain_service:3001/memories/${address}`);
    return response.data.memories;
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
};

// Start server
app.listen(PORT, () => {
  console.log(`Memory service running on port ${PORT}`);
});
