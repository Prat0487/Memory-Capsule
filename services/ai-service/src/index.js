import express from 'express';
import cors from 'cors';
import { generateBasicNarrative } from './functions/narrative-generator.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { getGenerativeModel } from './clients/vertex-client.js';
import sharp from 'sharp';

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlZTM2NzNhYi03ZTYzLTQwMTctYTEyZS1hNGY0ZWE2OWViYjAiLCJlbWFpbCI6InByYXJhczUucHJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjU1NjFmYzlmOTk4ZTA0Zjk1Y2U5Iiwic2NvcGVkS2V5U2VjcmV0IjoiODY0YTU1NGRiMDEwMjQ3ODIwZjFjYmRhYzFmNzNjOTFmMDVjODMyOTZiZTRhMDBlMTYzZDRiNDAyMDVkMGY5MyIsImV4cCI6MTc3MTg2ODM3NH0.-RBk-aBMmRNiotYxXEUHvHr1n4y2FheBgLC3G3iIQvI';

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'ai-service' });
});

// Add a network diagnostic endpoint
app.get('/api/network-test', async (req, res) => {
  const results = {
    pinata: { success: false, error: null, latency: null },
    ipfs: { success: false, error: null, latency: null }
  };
  
  // Test Pinata API
  try {
    const startTime = Date.now();
    await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers: { 'Authorization': `Bearer ${JWT}` },
      timeout: 5000
    });
    results.pinata.success = true;
    results.pinata.latency = Date.now() - startTime;
  } catch (error) {
    results.pinata.success = false;
    results.pinata.error = `${error.code || error.message}`;
  }
  
  // Test IPFS gateway
  try {
    const startTime = Date.now();
    await axios.get('https://ipfs.io/ipfs/QmZtmD2qt6fJot32nabSP3CUjicnypEBz7bHVDhPQt9aAy', {
      timeout: 5000
    });
    results.ipfs.success = true;
    results.ipfs.latency = Date.now() - startTime;
  } catch (error) {
    results.ipfs.success = false;
    results.ipfs.error = `${error.code || error.message}`;
  }
  
  res.json(results);
});

// Narrative generation endpoint
app.post('/api/generate-narrative', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Memory description is required' 
      });
    }
    
    // Generate narrative using your AI model
    const narrative = await generateBasicNarrative(description);
    
    res.status(200).json({
      success: true,
      narrative
    });
  } catch (error) {
    console.error('Error in narrative API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate narrative' 
    });
  }
});

// Add these constants at the top of your file
const MAX_UPLOAD_RETRIES = 5;
const DNS_RETRY_DELAY = 2000; // 2 seconds

// Function to upload to Pinata with DNS retry
async function uploadToPinata(buffer, filename, metadata, maxRetries = 5) {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      if (retryCount > 0) {
        console.log(`Retrying Pinata upload (attempt ${retryCount + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, Math.min(Math.pow(2, retryCount) * 1000, 10000)));
      }
      
      console.log('Uploading to Pinata...');
      
      const formData = new FormData();
      
      // Add the file
      formData.append('file', buffer, {
        filename: filename,
        contentType: 'image/jpeg',
      });
      
      // Add metadata
      formData.append('pinataMetadata', JSON.stringify(metadata));
      
      // Set Pinata options
      const pinataOptions = JSON.stringify({
        cidVersion: 1
      });
      formData.append('pinataOptions', pinataOptions);
      
      // Try uploading to Pinata
      const pinataResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          maxBodyLength: Infinity,
          timeout: 30000,
          headers: {
            'Authorization': `Bearer ${JWT}`,
            ...formData.getHeaders()
          }
        }
      );
      
      console.log('Upload successful, IPFS hash:', pinataResponse.data.IpfsHash);
      return pinataResponse.data.IpfsHash;
    } catch (error) {
      retryCount++;
      
      if (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND') {
        console.log('DNS resolution error, will retry...');
      } else {
        console.log(`Upload attempt ${retryCount} failed: ${error.message}`);
      }
      
      if (retryCount >= maxRetries) {
        throw new Error(`Failed to upload after ${maxRetries} attempts: ${error.message}`);
      }
    }
  }
}

// Function to encode image as base64 (fallback storage)
function encodeImageToBase64(buffer) {
  return buffer.toString('base64');
}

// Enhanced gateway manager with success tracking
const gatewayManager = {
  gateways: [
    'https://dweb.link/ipfs/',            // Historically reliable
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.ipfs.io/ipfs/'
  ],
  
  // Track rate limited gateways with cool-down periods
  rateLimited: new Map(),
  
  // Track success/failure history
  history: new Map(),
  
  // Initialize history for all gateways
  initialize() {
    this.gateways.forEach(gateway => {
      if (!this.history.has(gateway)) {
        this.history.set(gateway, {
          success: 0,
          failure: 0,
          lastSuccess: null,
          successRate: 0
        });
      }
    });
  },
  
  // Record a successful download
  recordSuccess(gateway) {
    if (!this.history.has(gateway)) {
      this.initialize();
    }
    
    const stats = this.history.get(gateway);
    stats.success++;
    stats.lastSuccess = Date.now();
    stats.successRate = stats.success / (stats.success + stats.failure);
    
    console.log(`Gateway ${gateway} success rate: ${(stats.successRate * 100).toFixed(1)}%`);
  },
  
  // Record a failed download
  recordFailure(gateway, statusCode) {
    if (!this.history.has(gateway)) {
      this.initialize();
    }
    
    const stats = this.history.get(gateway);
    stats.failure++;
    stats.successRate = stats.success / (stats.success + stats.failure);
    
    console.log(`Gateway ${gateway} failed with ${statusCode}, success rate: ${(stats.successRate * 100).toFixed(1)}%`);
  },
  
  // Get the best available gateway based on historical performance
  getGateway() {
    this.initialize();
    const now = Date.now();
    
    // Filter out rate-limited gateways
    const availableGateways = this.gateways.filter(gateway => {
      if (!this.rateLimited.has(gateway)) return true;
      
      const cooldownUntil = this.rateLimited.get(gateway);
      if (now > cooldownUntil) {
        this.rateLimited.delete(gateway);
        return true;
      }
      
      return false;
    });
    
    if (availableGateways.length === 0) {
      // All gateways are rate limited, use the one with shortest cooldown
      let earliestCooldown = Infinity;
      let bestGateway = this.gateways[0];
      
      this.rateLimited.forEach((cooldownTime, gateway) => {
        if (cooldownTime < earliestCooldown) {
          earliestCooldown = cooldownTime;
          bestGateway = gateway;
        }
      });
      
      return bestGateway;
    }
    
    // Special case: if dweb.link is available and has any success, prioritize it
    const dwebLink = 'https://dweb.link/ipfs/';
    if (availableGateways.includes(dwebLink) && 
        this.history.has(dwebLink) && 
        this.history.get(dwebLink).success > 0) {
      console.log('Prioritizing dweb.link based on past success');
      return dwebLink;
    }
    
    // Sort gateways by success rate (highest first)
    const sortedGateways = [...availableGateways].sort((a, b) => {
      const statsA = this.history.get(a) || { successRate: 0 };
      const statsB = this.history.get(b) || { successRate: 0 };
      
      // If success rates are close, prefer the one with more attempts
      if (Math.abs(statsA.successRate - statsB.successRate) < 0.1) {
        const attemptsA = statsA.success + statsA.failure;
        const attemptsB = statsB.success + statsB.failure;
        return attemptsB - attemptsA;
      }
      
      return statsB.successRate - statsA.successRate;
    });
    
    // Choose the gateway with highest success rate
    return sortedGateways[0];
  },
  
  // Mark a gateway as rate limited
  markRateLimited(gateway, cooldownSeconds = 60) {
    const cooldownUntil = Date.now() + (cooldownSeconds * 1000);
    console.log(`Marking gateway ${gateway} as rate limited for ${cooldownSeconds} seconds`);
    this.rateLimited.set(gateway, cooldownUntil);
  }
};

// Near the initialization code
const HISTORY_FILE = '/app/data/gateway-history.json';

// Load history from file if it exists
try {
  if (fs.existsSync(HISTORY_FILE)) {
    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    historyData.forEach((entry) => {
      gatewayManager.history.set(entry.gateway, entry.stats);
    });
    console.log('Loaded gateway history from file');
  }
} catch (error) {
  console.warn('Failed to load gateway history:', error.message);
}

// Save history periodically
setInterval(() => {
  try {
    const historyData = Array.from(gatewayManager.history.entries()).map(([gateway, stats]) => ({
      gateway,
      stats
    }));
    
    fs.mkdirSync('/app/data', { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyData, null, 2));
    console.log('Saved gateway history to file');
  } catch (error) {
    console.warn('Failed to save gateway history:', error.message);
  }
}, 60000); // Save every minute

// Update the download function to use and update the performance history
async function downloadFromIPFS(ipfsHash, maxAttempts = 10) {
  // Initialize gateway history if not done yet
  gatewayManager.initialize();
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Add a delay if this is a retry
    if (attempt > 0) {
      const delay = Math.min(Math.pow(2, attempt) * 1000, 30000);
      console.log(`Retry attempt ${attempt+1}/${maxAttempts}, waiting ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Get the best gateway based on performance history
    const gateway = gatewayManager.getGateway();
    const url = `${gateway}${ipfsHash}`;
    
    try {
      console.log(`Downloading from ${url} (attempt ${attempt+1}/${maxAttempts})`);
      
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Record successful download
      gatewayManager.recordSuccess(gateway);
      console.log(`Successfully downloaded from ${gateway} (${response.data.length} bytes)`);
      return Buffer.from(response.data);
    } catch (error) {
      const statusCode = error.response?.status || 'network error';
      console.warn(`Failed to download from ${gateway}: ${error.message}`);
      
      // Record failure
      gatewayManager.recordFailure(gateway, statusCode);
      
      if (error.response?.status === 429) {
        // This gateway is rate limited
        gatewayManager.markRateLimited(gateway, 120); // 2 minute cooldown
      } else if (error.response?.status === 403) {
        // Forbidden - this gateway likely doesn't have the content
        gatewayManager.markRateLimited(gateway, 300); // 5 minute cooldown
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        // Gateway timeout
        gatewayManager.markRateLimited(gateway, 30); // 30 second cooldown
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxAttempts - 1) {
        throw new Error(`Failed to download after ${maxAttempts} attempts: ${error.message}`);
      }
      // Otherwise continue to the next attempt
    }
  }
}

// Update the enhanceImageWithAI function
async function enhanceImageWithAI(description, ipfsHash) {
  try {
    console.log(`Starting image enhancement for IPFS hash: ${ipfsHash}`);
    
    // Use the improved download function
    let imageBuffer;
    try {
      imageBuffer = await downloadFromIPFS(ipfsHash);
      console.log(`Image download successful (${imageBuffer.length} bytes)`);
    } catch (downloadError) {
      console.error('All download attempts failed:', downloadError.message);
      throw new Error(`Failed to download image: ${downloadError.message}`);
    }
    
    // Continue with image enhancement
    console.log('Enhancing image with sharp');
    try {
      // Apply a slightly more subtle enhancement to avoid issues
      const enhancedBuffer = await sharp(imageBuffer)
        .normalize() // Balance color
        .modulate({ brightness: 1.05, saturation: 1.1 }) // Slight boost to brightness/saturation
        .sharpen({ sigma: 0.8 }) // Gentle sharpening
        .jpeg({ quality: 85 }) // Good quality JPEG
        .toBuffer();
      
      console.log(`Image enhanced (${enhancedBuffer.length} bytes)`);
      
      // Save enhanced image to disk for fallback
      const timestamp = Date.now();
      const filename = `enhanced_${timestamp}.jpg`;
      const filePath = `/tmp/${filename}`;
      await sharp(enhancedBuffer).toFile(filePath);
      console.log(`Enhanced image saved to ${filePath}`);
      
      // Try to upload to Pinata, but don't fail if it doesn't work
      try {
        // Attempt Pinata upload
        const ipfsHash = await uploadToPinata(enhancedBuffer, filename, {
          name: `Enhanced: ${description.substring(0, 30)}...`
        });
        
        // If successful, return the hash
        return {
          type: 'ipfs',
          id: ipfsHash,
          url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
        };
      } catch (uploadError) {
        console.log('Pinata upload failed, using local storage');
        
        // Return a local reference instead
        return {
          type: 'local',
          id: timestamp.toString(),
          url: `/local-image/${timestamp}`
        };
      }
    } catch (enhanceError) {
      console.error('Error enhancing image:', enhanceError.message);
      throw new Error(`Failed to enhance image: ${enhanceError.message}`);
    }
  } catch (error) {
    console.error('Error in enhanceImageWithAI:', error);
    throw error;
  }
}

// Add an endpoint to serve locally stored enhanced images
app.get('/local-image/:timestamp', (req, res) => {
  const { timestamp } = req.params;
  const filePath = `/tmp/enhanced_${timestamp}.jpg`;
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`Local image not found: ${filePath}`);
      return res.status(404).send('Enhanced image not found');
    }
    
    res.setHeader('Content-Type', 'image/jpeg');
    fs.createReadStream(filePath).pipe(res);
  });
});

// Update the enhance-image endpoint
app.post('/api/enhance-image', async (req, res) => {
  try {
    const { description, ipfsHash } = req.body;
    
    if (!description || !ipfsHash) {
      return res.status(400).json({ 
        success: false, 
        error: 'Both description and ipfsHash are required' 
      });
    }
    
    console.log(`Enhancing image ${ipfsHash} based on description: ${description}`);
    
    // Download the image from IPFS
    let imageBuffer;
    try {
      imageBuffer = await downloadFromIPFS(ipfsHash);
      console.log(`Image download successful (${imageBuffer.length} bytes)`);
    } catch (downloadError) {
      console.error('Failed to download image:', downloadError.message);
      return res.status(500).json({
        success: false,
        error: `Failed to download original image: ${downloadError.message}`
      });
    }
    
    // Process the image with sharp
    let enhancedBuffer;
    try {
      console.log('Enhancing image with sharp');
      enhancedBuffer = await sharp(imageBuffer)
        .normalize()
        .modulate({ brightness: 1.1, saturation: 1.2 })
        .sharpen()
        .jpeg({ quality: 85 })
        .toBuffer();
      console.log(`Image enhanced (${enhancedBuffer.length} bytes)`);
    } catch (enhanceError) {
      console.error('Failed to enhance image:', enhanceError.message);
      return res.status(500).json({
        success: false,
        error: `Failed to enhance image: ${enhanceError.message}`
      });
    }
    
    // Save a local backup
    const timestamp = Date.now();
    const filePath = `/tmp/enhanced_${timestamp}.jpg`;
    await sharp(enhancedBuffer).toFile(filePath);
    console.log(`Enhanced image saved to ${filePath}`);
    
    // Upload to Pinata
    let enhancedIpfsHash;
    let isLocalStorage = false;
    
    try {
      console.log('Uploading to Pinata...');
      enhancedIpfsHash = await uploadToPinata(enhancedBuffer, `enhanced_${timestamp}.jpg`, {
        name: `Enhanced: ${description.substring(0, 30)}...`,
        description: description
      });
      
      console.log(`Upload successful, IPFS hash: ${enhancedIpfsHash}`);
    } catch (uploadError) {
      console.error('All Pinata upload attempts failed:', uploadError.message);
      
      // Fall back to local storage
      enhancedIpfsHash = `local_${timestamp}`;
      isLocalStorage = true;
      
      console.log(`Using local storage: ${enhancedIpfsHash}`);
    }
    
    // Return the result
    return res.status(200).json({
      success: true,
      originalIpfsHash: ipfsHash,
      enhancedIpfsHash: enhancedIpfsHash, // This must be different from the original hash
      enhancedImageUrl: isLocalStorage 
        ? `/local-image/${timestamp}`
        : `https://gateway.pinata.cloud/ipfs/${enhancedIpfsHash}`,
      isLocalStorage: isLocalStorage,
      enhancementDetails: {
        originalSize: imageBuffer.length,
        enhancedSize: enhancedBuffer.length,
        timestamp: timestamp
      }
    });
  } catch (error) {
    console.error('Error in enhance-image API:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to enhance image' 
    });
  }
});

// At the end of your file
console.log('Starting server initialization');

// Create a single server instance
let server;

// Global port variable
const PORT = process.env.PORT || 3001;

// Start the server with port conflict handling
function startServer(port = PORT) {
  try {
    // Close previous server if it exists
    if (server) {
      server.close();
    }
    
    // Create new server
    server = app.listen(port, () => {
      console.log(`AI service running on port ${port}`);
    });
    
    // Handle errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use. Trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', error);
      }
    });
    
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    return null;
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
});

// Start the server
startServer();

// Export the server for testing purposes
// At the top of your file with other imports


// Add this function before it's used in enhanceImageWithAI
const uploadEnhancedImage = async (enhancedImagePath) => {
  try {
    console.log('Uploading enhanced image to IPFS using base64...');
    
    // Check if file exists
    if (!fs.existsSync(enhancedImagePath)) {
      throw new Error(`Enhanced image file not found: ${enhancedImagePath}`);
    }
    
    // Read file as base64
    const imageBuffer = fs.readFileSync(enhancedImagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    // Create payload
    const payload = {
      image: base64Image,
      filename: path.basename(enhancedImagePath)
    };
    
    // Use the dedicated base64 endpoint
    const response = await axios.post('http://ipfs-service:3002/upload-base64', payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000
    });
    
    console.log('Enhanced image uploaded successfully');
    return response.data;
  } catch (error) {
    console.error('Error uploading to IPFS:', error.message);
    console.log('Failed to upload enhanced image, returning original hash');
    return { 
      success: false, 
      error: error.message,
      originalHash: true
    };
  }
};

export { server };