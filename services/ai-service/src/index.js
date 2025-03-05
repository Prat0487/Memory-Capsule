import express from 'express';
import cors from 'cors';
import { generateBasicNarrative } from './functions/narrative-generator.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { getGenerativeModel } from './clients/vertex-client.js';
import sharp from 'sharp';

const app = express();
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

// Image enhancement endpoint
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
    
    // Step 1: Create a temporary file for the image
    // Create a temporary directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempImagePath = path.join(tempDir, `temp_image_${Date.now()}.${contentType.split('/')[1] || 'jpg'}`);
    fs.writeFileSync(tempImagePath, Buffer.from(imageData));
    
    // Step 2: Get AI analysis and enhancement suggestions
    console.log('Getting AI model for image analysis...');
    const model = getGenerativeModel(); // Use default gemini-1.5-pro
    
    const prompt = `
      Analyze this image and provide specific enhancement parameters I can apply.
      The image relates to: "${description}"
      
      Please provide numerical parameters for these enhancements:
      1. Saturation adjustment (0.8-1.5)
      2. Contrast adjustment (0.8-1.5)
      3. Brightness adjustment (0.8-1.5)
      4. Sharpness level (0-5)
      5. Warmth/coolness (-30 to +30)
      
      Format your response exactly like this example:
      {
        "saturation": 1.2,
        "contrast": 1.1,
        "brightness": 1.05,
        "sharpness": 2,
        "temperature": 10
      }
      
      Only return this JSON object, nothing else.
    `;
    
    // Step 3: Process the image using Vertex AI for analysis
    try {
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
        }]
      });
      
      // Step 4: Extract the enhancement parameters from the AI response
      const responseText = result.response.candidates[0].content.parts[0].text;
      console.log('AI enhancement suggestions:', responseText);
      
      // Try to extract the JSON object
      let enhancementParams = {};
      try {
        // Look for JSON object in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          enhancementParams = JSON.parse(jsonMatch[0]);
          console.log('Parsed enhancement parameters:', enhancementParams);
        } else {
          // Use default enhancement parameters
          enhancementParams = {
            saturation: 1.2,
            contrast: 1.1,
            brightness: 1.05,
            sharpness: 2,
            temperature: 10
          };
          console.log('Using default enhancement parameters');
        }
      } catch (parseError) {
        console.error('Error parsing enhancement parameters:', parseError);
        // Use default enhancement parameters
        enhancementParams = {
          saturation: 1.2,
          contrast: 1.1,
          brightness: 1.05,
          sharpness: 2,
          temperature: 10
        };
        console.log('Using default enhancement parameters due to parsing error');
      }
      
      // Step 5: Apply the enhancements using Sharp
      console.log('Applying image enhancements with Sharp...');
      let sharpImage = sharp(tempImagePath);
      
      // Apply saturation, contrast, brightness
      sharpImage = sharpImage.modulate({
        saturation: enhancementParams.saturation || 1.2,
        brightness: enhancementParams.brightness || 1.05
      });
      
      // Apply contrast
      sharpImage = sharpImage.linear(
        enhancementParams.contrast || 1.1, // multiply
        0 // add (offset)
      );
      
      // Apply sharpness
      if (enhancementParams.sharpness > 0) {
        sharpImage = sharpImage.sharpen(enhancementParams.sharpness || 2);
      }
      
      // Apply color temperature adjustment (tint)
      if (enhancementParams.temperature) {
        // Warm (positive values) or cool (negative values) tint
        const temp = enhancementParams.temperature || 0;
        if (temp > 0) {
          // Warm tint (more red/yellow)
          sharpImage = sharpImage.tint({ r: 255, g: 240, b: 230 });
        } else if (temp < 0) {
          // Cool tint (more blue)
          sharpImage = sharpImage.tint({ r: 230, g: 240, b: 255 });
        }
      }
      
      // Save the enhanced image
      const enhancedImagePath = path.join(tempDir, `enhanced_image_${Date.now()}.jpg`);
      await sharpImage.toFile(enhancedImagePath);
      console.log('Enhancement complete, saved to:', enhancedImagePath);
              const uploadEnhancedImage = async (enhancedImagePath) => {
                try {
                  console.log('Uploading enhanced image to IPFS...');
    
                  // Use the already imported FormData 
                  const form = new FormData();
    
                  // Read the file directly
                  const fileContent = fs.readFileSync(enhancedImagePath);
    
                  // Add the file with field name 'file'
                  form.append('file', fileContent, {
                    filename: path.basename(enhancedImagePath),
                    contentType: 'image/jpeg'
                  });
    
                  // Make the request with proper headers from form-data
                  const response = await axios.post('http://ipfs-service:3002/upload', form, {
                    headers: form.getHeaders()
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
              const ipfsResponse = await uploadEnhancedImage(enhancedImagePath);
      // Step 7: Clean up temporary files
      try {
        fs.unlinkSync(tempImagePath);
        fs.unlinkSync(enhancedImagePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp files:', cleanupError);
      }
      
      // Step 8: Return the new IPFS hash
      if (ipfsResponse && ipfsResponse.success && ipfsResponse.ipfsHash) {
        console.log(`Image enhancement complete, new IPFS hash: ${ipfsResponse.ipfsHash}`);
        return ipfsResponse.ipfsHash;
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


export { server };