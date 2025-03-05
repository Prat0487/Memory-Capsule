const { getVertexClient, getGenerativeModel } = require('../clients/vertex-client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const FormData = require('form-data');

/**
 * Enhances an image using Vertex AI based on text description
 * @param {string} description - User provided description
 * @param {string} ipfsHash - Original image IPFS hash
 * @returns {Promise<string>} - Enhanced image IPFS hash or original hash on failure
 */
async function enhanceImageWithAI(description, ipfsHash) {
  const tempDir = path.join(os.tmpdir(), 'memory-capsule-images');
  const originalImagePath = path.join(tempDir, `original-${Date.now()}.jpg`);
  const enhancedImagePath = path.join(tempDir, `enhanced-${Date.now()}.jpg`);
  
  try {
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    console.log(`Downloading original image from IPFS: ${ipfsHash}`);
    
    // Download original image from IPFS
    const imageUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);
    
    // Save original image to temp file
    fs.writeFileSync(originalImagePath, imageBuffer);
    console.log(`Original image saved to: ${originalImagePath}`);
    
    // Get Vertex AI model for image processing
    // Note: Use 'gemini-1.5-pro-vision' or another appropriate model that can handle images
    const model = getGenerativeModel('gemini-1.5-pro-vision');
    
    console.log('Processing image with Vertex AI...');
    
    // Generate enhancement prompt based on description
    const enhancementPrompt = `
      Enhance this image based on the following description: "${description}".
      
      Apply artistic improvements that match the emotional tone and context described.
      Focus on:
      - Adjusting colors to match the mood
      - Enhancing details that relate to the description
      - Adding artistic effects that complement the memory
      
      Return the enhanced version of the image only.
    `;
    
    // Process image with Vertex AI
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: enhancementPrompt },
          { 
            inlineData: { 
              mimeType: 'image/jpeg',
              data: imageBuffer.toString('base64')
            } 
          }
        ]
      }]
    });
    
    // Get enhanced image data from response
    if (result.response.candidates[0].content.parts) {
      const enhancedImagePart = result.response.candidates[0].content.parts.find(
        part => part.inlineData && part.inlineData.mimeType.startsWith('image/')
      );
      
      if (enhancedImagePart && enhancedImagePart.inlineData && enhancedImagePart.inlineData.data) {
        // Save enhanced image
        const enhancedImageBuffer = Buffer.from(enhancedImagePart.inlineData.data, 'base64');
        fs.writeFileSync(enhancedImagePath, enhancedImageBuffer);
        console.log(`Enhanced image saved to: ${enhancedImagePath}`);
        
        // Upload to IPFS
        const newHash = await uploadToIPFS(enhancedImagePath);
        console.log(`Enhanced image uploaded to IPFS: ${newHash}`);
        return newHash;
      }
    }
    
    console.log('No enhanced image found in response, returning original hash');
    return ipfsHash;
    
  } catch (error) {
    console.error('Error in enhanceImageWithAI:', error);
    // Important: Always return original hash on failure
    return ipfsHash;
  } finally {
    // Clean up temp files
    try {
      if (fs.existsSync(originalImagePath)) fs.unlinkSync(originalImagePath);
      if (fs.existsSync(enhancedImagePath)) fs.unlinkSync(enhancedImagePath);
    } catch (e) {
      console.error('Error cleaning up temp files:', e);
    }
  }
}

/**
 * Uploads a file to IPFS
 * @param {string} filePath - Path to file to upload
 * @returns {Promise<string>} - IPFS hash
 */
async function uploadToIPFS(filePath) {
  try {
    // Create form data for upload
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    // Add metadata
    const pinataMetadata = JSON.stringify({
      name: `AI-Enhanced-${Date.now()}`
    });
    form.append('pinataMetadata', pinataMetadata);
    
    // Use environment variables for API keys
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_API_KEY;
    
    if (!pinataApiKey || !pinataSecretKey) {
      throw new Error('Pinata API keys not found in environment variables');
    }
    
    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      form,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretKey
        }
      }
    );
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

module.exports = { enhanceImageWithAI };
