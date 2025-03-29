import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Use environment variable with fallback
const IPFS_SERVICE_URL = process.env.IPFS_SERVICE_URL || 'http://ipfs-service:3002';

export async function uploadFileToIPFS(filePath) {
  try {
    console.log(`Attempting to upload file to IPFS at ${IPFS_SERVICE_URL}/upload`);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    // Make request with timeout and retry logic
    const response = await axios.post(`${IPFS_SERVICE_URL}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    return response.data;
  } catch (error) {
    console.error('IPFS upload error:', error.message);
    
    // Enhanced error handling with network diagnostics
    if (error.code === 'ENOTFOUND') {
      console.error(`Network resolution failed for ${IPFS_SERVICE_URL}`);
      console.error('Check Docker network configuration and service names');
      
      // Try to ping the service
      try {
        await axios.get(`${IPFS_SERVICE_URL}/healthcheck`, { timeout: 5000 });
      } catch (pingError) {
        console.error('Health check also failed:', pingError.message);
      }
    }
    
    throw error;
  }
}
