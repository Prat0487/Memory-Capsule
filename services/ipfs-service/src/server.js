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
const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`IPFS Storage Service running on port ${PORT} bound to all interfaces`);
});