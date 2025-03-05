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
    let fileUrls = [];
    
    // Process files if they exist
    if (files.length > 0) {
      try {
        // Call IPFS service
        const storageResponse = await axios.post('http://ipfs-service:3002/upload', { 
          files: files.map(file => ({
            buffer: file.buffer.toString('base64'),
            originalname: file.originalname,
            mimetype: file.mimetype
          }))
        });
        
        ipfsHash = storageResponse.data.ipfsHash;
        fileUrls = storageResponse.data.fileUrls;
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
      }
    }
    
    // Add this validation before database insert
    if (!ipfsHash) {
      // If no ipfsHash, generate a temporary one using a timestamp
      ipfsHash = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Or reject the request entirely
      return res.status(400).json({
        success: false,
        error: 'Failed to generate IPFS hash for memory content',
        details: 'Storage service unavailable or failed to process files'
      });
    }
          let narrativeText = '';

          // Check if narrative generation is requested
          if (req.body.generateNarrative === 'true') {
            console.log('NARRATIVE FEATURE: Generating narrative from description');
  
            // Simple template-based narrative generation
            const templates = [
              "This captured moment shows {description}. It represents a unique chapter in your life journey, preserved forever in your memory capsule.",
              "The memory of {description} is now immortalized. Years from now, you'll look back at this moment and reconnect with the emotions it carries.",
              "Every memory tells a story. This one, capturing {description}, is a testament to the experiences that shape who you are."
            ];
  
            // Select a template and replace placeholder with actual description
            const template = templates[Math.floor(Math.random() * templates.length)];
            narrativeText = template.replace('{description}', req.body.description);
  
            console.log('NARRATIVE FEATURE: Generated narrative:', narrativeText);
          }

          // Create record with exact column names matching Supabase schema
          const memoryData = { 
            title: req.body.title || "Untitled Memory", 
            description: req.body.description || "", 
            created_at: new Date().toISOString(), 
            ipfsHash: ipfsHash,  // This will never be null now
            url: fileUrls.length > 0 ? fileUrls[0] : "",
            ownerAddress: owner,
            narrative: narrativeText, // Use the generated narrative instead of empty string
            type: "standard",
            sharecount: 0
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
    
    // Fetch memories directly from Supabase
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('ownerAddress', address)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.json({ success: true, memories: data });
  } catch (error) {
    console.error('Error fetching memories:', error);
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
