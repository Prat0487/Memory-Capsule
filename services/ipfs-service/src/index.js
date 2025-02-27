import axios from 'axios'
import FormData from 'form-data'

const PINATA_API_KEY = '5561fc9f998e04f95ce9'
const PINATA_SECRET = '864a554db010247820f1cbdac1f73c91f05c83296be4a00e163d4b40205d0f93'
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlZTM2NzNhYi03ZTYzLTQwMTctYTEyZS1hNGY0ZWE2OWViYjAiLCJlbWFpbCI6InByYXJhczUucHJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjU1NjFmYzlmOTk4ZTA0Zjk1Y2U5Iiwic2NvcGVkS2V5U2VjcmV0IjoiODY0YTU1NGRiMDEwMjQ3ODIwZjFjYmRhYzFmNzNjOTFmMDVjODMyOTZiZTRhMDBlMTYzZDRiNDAyMDVkMGY5MyIsImV4cCI6MTc3MTg2ODM3NH0.-RBk-aBMmRNiotYxXEUHvHr1n4y2FheBgLC3G3iIQvI'

export async function uploadToIPFS(files) {
  const results = []
  
  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add metadata with timestamp and file info
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    })
    formData.append('pinataMetadata', metadata)

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
    })
    formData.append('pinataOptions', pinataOptions)
    
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
      )
      
      results.push({
        name: file.name,
        type: file.type,
        size: file.size,
        cid: response.data.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        timestamp: new Date().toISOString()
      })
      
      console.log(`Successfully uploaded ${file.name}:`, response.data)
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      throw error
    }
  }
  
  return results
}

export function getIPFSUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`
}