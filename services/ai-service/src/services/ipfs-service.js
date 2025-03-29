// Replace the existing IPFS upload implementation with:
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const IPFS_SERVICE_URL = process.env.IPFS_SERVICE_URL || 'http://ipfs-service:3002';

export async function uploadToIPFS(filePath, fileName) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
      filename: fileName || 'enhanced_image.jpg'
    });
    
    // Make request to IPFS service
    const response = await axios.post(`${IPFS_SERVICE_URL}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    // Return the IPFS hash from the response
    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
    };
  } catch (error) {
    console.error('IPFS upload error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return {
      success: false,
      error: error.message
    };
  }
}
