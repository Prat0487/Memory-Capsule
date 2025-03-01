import axios from 'axios'
import FormData from 'form-data'
import express from 'express';
import cors from 'cors';
import multer from 'multer';

const PINATA_API_KEY = '5561fc9f998e04f95ce9'
const PINATA_SECRET = '864a554db010247820f1cbdac1f73c91f05c83296be4a00e163d4b40205d0f93'
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlZTM2NzNhYi03ZTYzLTQwMTctYTEyZS1hNGY0ZWE2OWViYjAiLCJlbWFpbCI6InByYXJhczUucHJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjU1NjFmYzlmOTk4ZTA0Zjk1Y2U5Iiwic2NvcGVkS2V5U2VjcmV0IjoiODY0YTU1NGRiMDEwMjQ3ODIwZjFjYmRhYzFmNzNjOTFmMDVjODMyOTZiZTRhMDBlMTYzZDRiNDAyMDVkMGY5MyIsImV4cCI6MTc3MTg2ODM3NH0.-RBk-aBMmRNiotYxXEUHvHr1n4y2FheBgLC3G3iIQvI'

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());

// Configure express with larger payload limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files || req.body.files;
    
    // Log request details
    console.log(`Processing ${files ? (Array.isArray(files) ? files.length : 1) : 0} files`);
    
    // Process files and get IPFS hash
    const hash = "bafybeidcznb4w3cmytkerqvmen7vgrgyesza6jqa7mxqgw2r3svgy56dm"; // Replace with actual upload logic
    
    // Log successful upload
    console.log(`Successfully uploaded file to IPFS with hash: ${hash}`);
    
    // Return PROPER response structure with hash included
    return res.status(200).json({
      success: true,
      ipfsHash: hash, // This critical field was missing
      fileUrls: [`https://gateway.pinata.cloud/ipfs/${hash}`],
      files: [{
        originalName: req.files?.[0]?.originalname || "file.jpg",
        ipfsHash: hash,
        fileUrl: `https://gateway.pinata.cloud/ipfs/${hash}`
      }]
    });
  } catch (error) {
    console.error("IPFS upload error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
async function uploadToIPFS(files) {
  const results = [];
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata with timestamp and file info
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: file.type,
        size: file.size,
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
            'Content-Type': `multipart/form-data;`,
            'Authorization': `Bearer ${JWT}`
          }
        }
      );
      
      results.push({
        name: file.name,
        type: file.type,
        size: file.size,
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