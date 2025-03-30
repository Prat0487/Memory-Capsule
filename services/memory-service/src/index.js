import express from 'express';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';
import supabase from './config/supabaseClient.js';
import fetch from 'node-fetch';
import memoriesRouter from './routes/memories.js';

// For Node.js versions that don't have global fetch
global.fetch = fetch;

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', memoriesRouter); // CRITICAL: This registers all routes

// Import the enhancement function
import { enhanceImage } from './controllers/imageEnhancement.js';

// Use the imported function instead
app.post('/api/enhance-memory-image', enhanceImage);

app.post('/memories/create', upload.array('files'), async (req, res) => {
  try {
    console.log('Request fields:', req.body);
    console.log('Uploaded files:', req.files ? req.files.length : 'none');
    
    const { title, description, date, owner, enhanceImage } = req.body;
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
    }
    
    // Create record with exact column names matching Supabase schema
    const memoryData = { 
      title: title || "Untitled Memory", 
      description: description || "", 
      created_at: date || new Date().toISOString(), 
      ipfsHash: ipfsHash,
      url: fileUrls.length > 0 ? fileUrls[0] : "",
      ownerAddress: owner,
      narrative: "", // Start with empty narrative
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
    
    const memory = data[0];
    
    // RESTORE THIS PART - Generate narrative in background if description exists
    if (description && description.length > 10) {
      console.log('Description meets minimum length for narrative generation');
      
      // Generate narrative in background 
      setTimeout(async () => {
        try {
          console.log(`Starting background narrative generation for memory ${memory.id}`);
          
          // Call AI service to generate narrative
          const aiResponse = await axios.post('http://ai-service:3003/api/generate-narrative', {
            description
          }, { timeout: 10000 });
          
          const narrative = aiResponse.data.narrative || '';
          
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
    
    // If enhanceImage is true, also trigger image enhancement
    if (enhanceImage === 'true' && ipfsHash) {
      setTimeout(async () => {
        const enhanceImageWithAI = async (memoryId, description, ipfsHash) => {
          try {
            console.log(`Enhancing image for memory ${memoryId}`);
            
            // Call AI service for image enhancement
            const aiResponse = await axios.post('http://ai-service:3003/api/enhance-image', {
              description,
              ipfsHash
            }, { timeout: 60000 });
            
            console.log('AI service full response:', JSON.stringify(aiResponse.data));
            
            // Extract enhanced hash with fallbacks
            const enhancedHash = aiResponse.data.enhancedImageHash || aiResponse.data.ipfsHash;
            const isLocalStorage = aiResponse.data.isLocalStorage === true;

            // Use appropriate URL based on storage type
            let enhancedUrl;
            if (isLocalStorage) {
              enhancedUrl = aiResponse.data.enhancedImageUrl;
            } else {
              enhancedUrl = `https://gateway.pinata.cloud/ipfs/${enhancedHash}`;
            }

            // Update database (without updated_at)
            await supabase
              .from('memories')
              .update({
                enhanced_image_hash: enhancedHash,
                enhanced_image_url: enhancedUrl,
                is_local_enhancement: isLocalStorage
              })
              .eq('id', memoryId);
            
            if (error) {
              console.error('Error updating memory with enhanced image:', error);
              return false;
            }
            
            console.log(`Successfully updated memory ${memoryId} with enhanced image`);
            return true;
          } catch (error) {
            console.error('Background image enhancement error:', error);
            return false;
          }
        };

        await enhanceImageWithAI(memory.id, description, ipfsHash);
      }, 200); // Small delay after narrative generation
    }
    
    res.status(201).json({
      success: true,
      memory: memory
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

// Add this test endpoint
app.get('/test-ai-connection', async (req, res) => {
  try {
    console.log('[DEBUG] Testing AI service connection...');
    const response = await axios.get('http://ai-service:3003/health');
    console.log('[DEBUG] AI service reachable:', response.data);
    res.json({ success: true, aiServiceResponse: response.data });
  } catch (error) {
    console.error('[DEBUG] AI service connection test failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

app.get('/test-db-update/:memoryId', async (req, res) => {
  try {
    const { memoryId } = req.params;
    console.log(`[DEBUG] Testing database update for memory ${memoryId}`);
    
    const testHash = `test-hash-${Date.now()}`;
    const testUrl = `https://gateway.pinata.cloud/ipfs/${testHash}`;
    
    const { data, error } = await supabase
      .from('memories')
      .update({
        enhanced_image_hash: testHash,
        enhanced_image_url: testUrl,
        is_local_enhancement: false,
        updated_at: new Date()
      })
      .eq('id', memoryId)
      .select();
    
    if (error) {
      console.error('[DEBUG] Database update error:', error);
      return res.status(500).json({ success: false, error });
    }
    
    console.log('[DEBUG] Database update result:', data);
    res.json({ success: true, updatedMemory: data });
  } catch (error) {
    console.error('[DEBUG] Test database update failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Memory service running on port ${PORT}`);
});