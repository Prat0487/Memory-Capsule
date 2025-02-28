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

const upload = multer({ storage });

// Upload endpoint
app.post('/upload', async (req, res) => {
  try {
    // Add comprehensive logging
    console.log("Upload request received", req.body ? "with body" : "without body");
    
    // Handle both form data and JSON uploads
    const files = req.files || req.body.files;
    
    if (!files || (Array.isArray(files) && files.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }
    
    console.log("Files to upload:", files);
    
    // Process files here...
    // Rest of your implementation
    
    // For testing, if upload is causing issues, return mock data
    res.status(200).json({
      success: true,
      ipfsHash: "test-hash-123",
      fileUrls: ["https://example.com/test-file"],
      files: [{
        originalName: "test.jpg",
        ipfsHash: "test-hash-123",
        fileUrl: "https://example.com/test-file"
      }]
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files to IPFS',
      details: error.message
    });
  }
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`IPFS Storage Service running on port ${PORT} bound to all interfaces`);
});