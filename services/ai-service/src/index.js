import express from 'express';
import cors from 'cors';
import { generateBasicNarrative } from './functions/narrative-generator.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware setup
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'ai-service' });
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

async function enhanceImageWithAI(description, ipfsHash) {
  try {
    console.log(`Starting image enhancement for IPFS hash: ${ipfsHash}`);
    
    // Extract just the hash if a full URL was passed
    let hash = ipfsHash;
    if (ipfsHash.includes('/ipfs/')) {
      hash = ipfsHash.split('/ipfs/').pop();
    }
    
    // Array of IPFS gateways to try if one fails
    const gateways = [
      'https://gateway.pinata.cloud/ipfs/',
      'https://ipfs.io/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://dweb.link/ipfs/'
    ];
    
    // Try different gateways if one fails
    let imageData = null;
    let contentType = 'image/jpeg';  // Default content type
    
    for (let i = 0; i < gateways.length; i++) {
      try {
        const imageUrl = `${gateways[i]}${hash}`;
        console.log(`Attempting to fetch image from: ${imageUrl}`);
        
        const imageResponse = await axios.get(imageUrl, { 
          responseType: 'arraybuffer',
          timeout: 10000  // 10 second timeout
        });
        
        imageData = imageResponse.data;
        contentType = imageResponse.headers['content-type'] || 'image/jpeg';
        console.log(`Successfully fetched image from ${gateways[i]}`);
        break;  // Success! Exit the loop
      } catch (err) {
        console.log(`Failed to fetch from ${gateways[i]}: ${err.message}`);
        
        // If this is the last gateway and all failed, throw error
        if (i === gateways.length - 1) {
          throw new Error('All IPFS gateways failed');
        }
        
        // Wait a bit before trying the next gateway
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!imageData) {
      throw new Error('Could not retrieve image from any gateway');
    }
    
    // Step 1: Get Vertex AI model
    console.log('Getting AI model for image enhancement...');
    const model = getGenerativeModel('gemini-1.5-pro');
    
    // Step 2: Create a temporary file for the image
    // Create a temporary directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempImagePath = path.join(tempDir, `temp_image_${Date.now()}.${contentType.split('/')[1] || 'jpg'}`);
    fs.writeFileSync(tempImagePath, Buffer.from(imageData));
    
    // Step 3: Create multipart request to Vertex AI
    console.log('Sending image to Vertex AI for enhancement...');
  const prompt = `
    Enhance this image based on the following description:
    "${description}"
  
    Focus on:
    - Improving visual quality
    - Adjusting colors to match the description's mood
    - Enhancing details mentioned in the description
    - Maintaining the original composition
  
    IMPORTANT: Return an enhanced version of this image as part of your response.
  `;
    
    // Step 4: Process the image using Vertex AI
    try {
      const model = getGenerativeModel();
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { 
              inline_data: {
                mime_type: contentType,
                data: fs.readFileSync(tempImagePath).toString('base64')
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40,
          responseMimeType: "image/png", // Request an image response
          maxOutputTokens: 1024
        }
      });
              // Immediately after receiving the response
              console.log('Examining AI response structure:', JSON.stringify(result.response, null, 2).substring(0, 500) + '...');

              // Try different ways to access the image data
              let enhancedImageData = null;

              // Method 1: Check candidates[0].content.parts for inline_data with image
              if (result.response.candidates?.[0]?.content?.parts) {
                enhancedImageData = result.response.candidates[0].content.parts.find(
                  part => part.inline_data?.mime_type?.startsWith('image/')
                );
              }

              // Method 2: If Method 1 fails, check if there's a direct parts array
              if (!enhancedImageData && result.response.parts) {
                enhancedImageData = result.response.parts.find(
                  part => part.inline_data?.mime_type?.startsWith('image/')
                );
              }

              // Method 3: Inspect for any other structure containing image data
              if (!enhancedImageData) {
                // If we still can't find it, log the full response structure for debugging
                console.log('Full AI response structure for debugging:', 
                  JSON.stringify(result.response, null, 2));
                console.log('No enhanced image found in expected locations');
              }
      
              if (!enhancedImageData) {
                console.log('No enhanced image returned from AI, using original image');
                // Clean up temporary file and return original hash
                fs.unlinkSync(tempImagePath);
                return hash;
              }
      // Step 6: Save the enhanced image
      const enhancedImageBuffer = Buffer.from(enhancedImageData.inline_data.data, 'base64');
      const enhancedImagePath = path.join(tempDir, `enhanced_image_${Date.now()}.${contentType.split('/')[1] || 'jpg'}`);
      fs.writeFileSync(enhancedImagePath, enhancedImageBuffer);
      
      // Step 7: Upload the enhanced image to IPFS
      console.log('Uploading enhanced image to IPFS...');
      const formData = new FormData();
      formData.append('file', fs.createReadStream(enhancedImagePath));
      
      const ipfsResponse = await axios.post('http://ipfs-service:3002/upload', formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Step 8: Clean up temporary files
      fs.unlinkSync(tempImagePath);
      fs.unlinkSync(enhancedImagePath);
      
      // Step 9: Return the new IPFS hash
      if (ipfsResponse.data && ipfsResponse.data.success && ipfsResponse.data.ipfsHash) {
        console.log(`Image enhancement complete, new IPFS hash: ${ipfsResponse.data.ipfsHash}`);
        return ipfsResponse.data.ipfsHash;
      } else {
        console.log('Failed to upload enhanced image, returning original hash');
        return hash;
      }
      
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      // Clean up and return original hash on error
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
      return hash;
    }
    
  } catch (error) {
    console.error("Error in image enhancement:", error);
    // Return the original hash if enhancement fails
    return ipfsHash.includes('/ipfs/') ? ipfsHash.split('/ipfs/').pop() : ipfsHash;
  }
}
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
    
    // Get the image from IPFS
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    // Call Vertex AI to enhance the image
    const enhancedImageHash = await enhanceImageWithAI(description, imageUrl);
    
    // Return the enhanced image hash
    res.status(200).json({
      success: true,
      originalIpfsHash: ipfsHash,
      enhancedImageHash: enhancedImageHash
    });
  } catch (error) {
    console.error('Error enhancing image:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to enhance image' 
    });
  }
});
// Start the server
// Add this import at the top of your file, with your other imports
import { getGenerativeModel } from './clients/vertex-client.js';

app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});