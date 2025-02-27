import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/upload', async (req, res) => {
  try {
    const memoryData = req.body;
    const memory = await createMemory(memoryData);
    res.status(201).json({ success: true, memory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
    // Upload to IPFS
    const ipfsResponse = await axios.post('http://ipfs_service:3002/upload', {
      files: memoryData.files
    });
    
    // Generate narrative with AI
    const aiResponse = await axios.post('http://ai_service:3003/generate', {
      description: memoryData.description,
      files: memoryData.files
    });
    
    // Mint NFT on blockchain
    const blockchainResponse = await axios.post('http://blockchain_service:3001/mint', {
      ...memoryData,
      ipfsHash: ipfsResponse.data.hash,
      narrative: aiResponse.data.narrative
    });
    
    return blockchainResponse.data.memory;
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
