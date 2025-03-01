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

app.post('/memories/create', upload.array('files'), async (req, res) => {
  try {
    console.log('Request fields:', req.body);
    console.log('Uploaded files:', req.files ? req.files.length : 'none');
    
    const { title, description, date, owner } = req.body;
    const files = req.files || [];
    
    let ipfsHash = null;
    let fileUrl = "";  // Note: singular, not plural
    
    // Process files if they exist
    if (files.length > 0) {
      try {
        // Call IPFS service with properly encoded files
        const storageResponse = await axios.post('http://ipfs-service:3002/upload', { 
          files: files.map(file => ({
            buffer: file.buffer.toString('base64'),
            originalname: file.originalname,
            mimetype: file.mimetype
          }))
        });
        
        console.log("IPFS response:", storageResponse.data);
        
        // Extract data using correct field names
        ipfsHash = storageResponse.data.ipfsHash;
        // Take the first URL if multiple files were uploaded
        fileUrl = storageResponse.data.fileUrls && storageResponse.data.fileUrls.length > 0 
          ? storageResponse.data.fileUrls[0] 
          : "";
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
      }
    }
    
    // Create record with exact column names matching Supabase schema
    const memoryData = { 
      title: title || "Untitled Memory", 
      description: description || "", 
      created_at: date || new Date().toISOString(), 
      ipfsHash: ipfsHash,  // Correct camelCase column name
      url: fileUrl,        // Singular field as per schema
      ownerAddress: owner, // Correct camelCase column name
      narrative: req.body.narrativeText || "",
      type: "standard",
      sharecount: 0        // Initialize share count
    };
    
    console.log("Inserting into Supabase:", memoryData);
    
    // Execute database insertion with correct column mapping
    const { data, error } = await supabase
      .from('memories')
      .insert([memoryData])
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
});
app.post('/memories/create', upload.array('files'), async (req, res) => {
  try {
    // All your existing POST handler code...
    
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
}); // Single closing brace for the POST endpoint

// Properly spaced next route definition
app.get('/memories/:address', async (req, res) => {
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
