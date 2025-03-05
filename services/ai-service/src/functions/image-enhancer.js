import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getGenerativeModel } from '../clients/vertex-client.js';
import { pinFileToIPFS } from '../utils/ipfs-utils.js';

export const enhanceImageWithAI = async (description, imageUrl) => {
  try {
    console.log(`Starting image enhancement for: ${imageUrl}`);
    console.log(`Description: ${description}`);
    
    // 1. Download the image from IPFS
    const imagePath = await downloadImage(imageUrl);
    
    // 2. Get image as base64
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    
    // 3. Prepare the prompt for image enhancement
    const prompt = `
      Enhance this image based on the following description:
      ${description}
      
      Make the following improvements:
      - Improve lighting and color balance
      - Enhance the overall composition
      - Bring focus to the important elements described
      - Add atmosphere that matches the emotional tone of the description
      - Make subtle improvements while maintaining authenticity
    `;
    
    // 4. Call Vertex AI vision model (Gemini Pro Vision)
    const model = getGenerativeModel('gemini-1.5-pro-vision');
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: getMimeType(imagePath), data: imageBase64 } }
        ]
      }]
    });
    
    // 5. Extract image from response
    const enhancedImageBase64 = extractImageFromResponse(result.response);
    
    if (!enhancedImageBase64) {
      console.log("No image in response, returning original hash");
      return imageUrl.split('/').pop(); // Return original hash
    }
    
    // 6. Save enhanced image to temp file
    const enhancedImagePath = await saveBase64Image(enhancedImageBase64);
    
    // 7. Upload enhanced image to IPFS
    const enhancedIpfsHash = await uploadToIPFS(enhancedImagePath);
    
    // 8. Clean up temp files
    fs.unlinkSync(imagePath);
    fs.unlinkSync(enhancedImagePath);
    
    console.log(`Image enhanced successfully. New IPFS hash: ${enhancedIpfsHash}`);
    return enhancedIpfsHash;
  } catch (error) {
    console.error('Error enhancing image:', error);
    // Return the original hash if enhancement fails
    return imageUrl.split('/').pop();
  }
};

// Helper function to download image from URL
async function downloadImage(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const tempDir = path.join(__dirname, '../../temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const fileName = `original_${Date.now()}.${getExtensionFromUrl(url)}`;
  const filePath = path.join(tempDir, fileName);
  
  fs.writeFileSync(filePath, response.data);
  return filePath;
}

// Helper function to get file extension from URL
function getExtensionFromUrl(url) {
  const extension = path.extname(url).slice(1);
  return extension || 'jpg';
}

// Helper function to get MIME type
function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mimeTypes[extension] || 'image/jpeg';
}

// Helper function to extract image from AI response
function extractImageFromResponse(response) {
  try {
    // This will depend on the exact response format from Vertex AI
    // You may need to adjust based on the actual response
    const candidates = response.candidates || [];
    if (candidates.length === 0) return null;
    
    const parts = candidates[0].content?.parts || [];
    const imagePart = parts.find(part => part.inlineData?.mimeType?.startsWith('image/'));
    
    return imagePart?.inlineData?.data || null;
  } catch (error) {
    console.error('Error extracting image from response:', error);
    return null;
  }
}

// Helper function to save base64 image to file
async function saveBase64Image(base64Data) {
  const tempDir = path.join(__dirname, '../../temp');
  const filePath = path.join(tempDir, `enhanced_${Date.now()}.jpg`);
  
  // Remove data:image/jpeg;base64, prefix if present
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
  
  // Write to file
  fs.writeFileSync(filePath, Buffer.from(base64Image, 'base64'));
  return filePath;
}

// Helper function to upload file to IPFS
async function uploadToIPFS(filePath) {
  try {
    // Read file
    const fileData = fs.readFileSync(filePath);
    
    // Get file metadata
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const mimeType = getMimeType(filePath);
    
    // Create form data for Pinata
    const formData = new FormData();
    formData.append('file', new Blob([fileData], { type: mimeType }), fileName);
    
    // Upload to IPFS via Pinata
    const result = await pinFileToIPFS(formData);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}