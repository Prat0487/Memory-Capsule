const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Pinata configuration
const PINATA_API_KEY = '5561fc9f998e04f95ce9';
const PINATA_SECRET = '864a554db010247820f1cbdac1f73c91f05c83296be4a00e163d4b40205d0f93';
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET);

// Middleware
app.use(cors());
app.use(express.json());

// File upload storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage }).single('file');
// Upload endpoint
app.post('/upload', upload, async (req, res) => {
  try {
    console.log("Upload request received");

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    console.log("File to upload:", file.originalname);

    const uploadToIPFS = async (filePath, originalName, mimetype) => {
      try {
        const readableStreamForFile = fs.createReadStream(filePath);
        const options = {
          pinataMetadata: {
            name: originalName
          }
        };

        const pinResult = await pinata.pinFileToIPFS(readableStreamForFile, options);
        
        return {
          success: true,
          ipfsHash: pinResult.IpfsHash,
          fileUrl: `https://gateway.pinata.cloud/ipfs/${pinResult.IpfsHash}`,
          originalName
        };
      } catch (error) {
        console.error("IPFS upload error:", error);
        throw error;
      }
    };

    const result = await uploadToIPFS(file.path, file.originalname, file.mimetype);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file to IPFS',
      details: error.message
    });
  }
});

app.post('/upload-enhanced', async (req, res) => {
  try {
    if (!req.body || !req.body.imageData) {
      return res.status(400).json({ error: 'Missing image data' });
    }
    
    const { imageData, filename = 'enhanced_image.jpg' } = req.body;
    
    const imageBuffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const tempFilePath = path.join(uploadDir, filename);
    
    fs.writeFileSync(tempFilePath, imageBuffer);
    
    const uploadToIPFS = async (filePath, originalName, mimetype) => {
      try {
        const readableStreamForFile = fs.createReadStream(filePath);
        const options = {
          pinataMetadata: {
            name: originalName
          }
        };

        const pinResult = await pinata.pinFileToIPFS(readableStreamForFile, options);
        
        return {
          success: true,
          ipfsHash: pinResult.IpfsHash,
          fileUrl: `https://gateway.pinata.cloud/ipfs/${pinResult.IpfsHash}`,
          originalName
        };
      } catch (error) {
        console.error("IPFS upload error:", error);
        throw error;
      }
    };
    
    const result = await uploadToIPFS(tempFilePath, filename, 'image/jpeg');
    
    fs.unlinkSync(tempFilePath);
    
    res.json(result);
  } catch (error) {
    console.error('Enhanced image upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a dedicated endpoint for base64 uploads that bypasses multer completely
app.post('/upload-base64', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    console.log("Base64 upload request received");
    
    // Validate request
    if (!req.body || !req.body.image) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing image data' 
      });
    }
    
    // Extract data from request
    const { image, filename = 'enhanced_image.jpg' } = req.body;
    
    // Decode base64 image
    let imageBuffer;
    try {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid base64 image data'
      });
    }
    
    // Save to temp file
    const tempDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFile = path.join(tempDir, `${Date.now()}-${filename}`);
    fs.writeFileSync(tempFile, imageBuffer);
    
    console.log(`Saved decoded image to ${tempFile}`);
    
    // Upload to Pinata
    try {
      const readableStream = fs.createReadStream(tempFile);
      const options = {
        pinataMetadata: {
          name: filename
        }
      };
      
      const result = await pinata.pinFileToIPFS(readableStream, options);
      
      // Clean up
      fs.unlinkSync(tempFile);
      
      const response = {
        success: true,
        ipfsHash: result.IpfsHash,
        fileUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        originalName: filename
      };
      
      console.log('Base64 upload successful:', response);
      return res.json(response);
    } catch (pinataError) {
      console.error('Pinata upload error:', pinataError);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload to IPFS',
        details: pinataError.message
      });
    }
  } catch (error) {
    console.error('Base64 upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`IPFS service running on port ${PORT}`);
});