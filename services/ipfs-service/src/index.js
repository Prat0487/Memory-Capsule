import axios from 'axios';
import FormData from 'form-data';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Buffer } from 'buffer';

const PINATA_API_KEY = '5561fc9f998e04f95ce9';
const PINATA_SECRET = '864a554db010247820f1cbdac1f73c91f05c83296be4a00e163d4b40205d0f93';
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlZTM2NzNhYi03ZTYzLTQwMTctYTEyZS1hNGY0ZWE2OWViYjAiLCJlbWFpbCI6InByYXJhczUucHJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjU1NjFmYzlmOTk4ZTA0Zjk1Y2U5Iiwic2NvcGVkS2V5U2VjcmV0IjoiODY0YTU1NGRiMDEwMjQ3ODIwZjFjYmRhYzFmNzNjOTFmMDVjODMyOTZiZTRhMDBlMTYzZDRiNDAyMDVkMGY5MyIsImV4cCI6MTc3MTg2ODM3NH0.-RBk-aBMmRNiotYxXEUHvHr1n4y2FheBgLC3G3iIQvI';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

app.get('/healthcheck', (req, res) => {
  console.log('Health check received');
  res.status(200).json({
    status: 'healthy',
    endpoints: [
      { path: '/upload', method: 'POST', description: 'Upload file to IPFS' },
      // List other endpoints
    ]
  });
});

console.log('IPFS service initialized with routes:');
console.log('- POST /upload: Upload file to IPFS');
// List other routes

app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    console.log("Processing upload request");
    
    let filesToProcess = [];
    
    // Handle multipart form data (files directly uploaded)
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} files from multipart form data`);
      filesToProcess = req.files.map(file => ({
        buffer: file.buffer,
        name: file.originalname,
        type: file.mimetype
      }));
    } 
    // Handle JSON payload with base64-encoded files
    else if (req.body && req.body.files) {
      console.log(`Processing ${req.body.files.length} files from JSON payload`);
      filesToProcess = req.body.files.map(file => ({
        buffer: Buffer.from(file.buffer, 'base64'),
        name: file.originalname,
        type: file.mimetype
      }));
    } else {
      return res.status(400).json({
        success: false,
        error: 'No files provided in the request'
      });
    }
    
    // Now we have a consistent format for all files
    const results = await uploadToIPFS(filesToProcess);
    
    // Use the first file as the main result if available
    const mainResult = results[0] || { 
      cid: "temp-" + Date.now(), 
      url: "" 
    };
    
    return res.status(200).json({
      success: true,
      ipfsHash: mainResult.cid,
      fileUrls: results.map(r => r.url),
      files: results.map(r => ({
        originalName: r.name,
        ipfsHash: r.cid,
        fileUrl: r.url
      }))
    });
  } catch (error) {
    console.error("IPFS upload error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

async function uploadToIPFS(files) {
  console.log(`Starting uploadToIPFS with ${files.length} files`);
  const results = [];
  
  for (const file of files) {
    const formData = new FormData();
    
    // Use the buffer directly - no need for Blob in Node.js
    formData.append('file', file.buffer, {
      filename: file.name,
      contentType: file.type
    });
    
    // Add metadata with timestamp and file info
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: file.type,
        size: file.buffer.length,
        uploadedAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    // Add pinning options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
      customPinPolicy: {
        regions: [
          {
            id: 'FRA1',
            desiredReplicationCount: 1
          },
          {
            id: 'NYC1',
            desiredReplicationCount: 1
          }
        ]
      }
    });
    formData.append('pinataOptions', pinataOptions);
    
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${JWT}`
          }
        }
      );
      
      results.push({
        name: file.name,
        type: file.type,
        size: file.buffer.length,
        cid: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Successfully uploaded ${file.name}:`, response.data);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw error;
    }
  }
  
  return results;
}
export function getIPFSUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`IPFS Storage Service running on port ${PORT}`);
});
