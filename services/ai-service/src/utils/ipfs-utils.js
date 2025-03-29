import axios from 'axios';
import FormData from 'form-data';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

export const pinFileToIPFS = async (file) => {
  try {
    // Create a new FormData instance
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to Pinata
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders()
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error pinning file to IPFS:', error);
    throw error;
  }
};
