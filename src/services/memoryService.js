import { uploadToIPFS } from './ipfs'

const API_BASE_URL = 'http://localhost:3000'

export class MemoryService {
  async createMemory(files, metadata) {
    const uploadResults = await uploadToIPFS(files)
    
    const memoryData = uploadResults.map(result => ({
      title: metadata.title,
      description: metadata.description,
      ipfsHash: result.cid,
      type: files[0].type?.split('/')[0] || 'image',
      ownerAddress: metadata.ownerAddress,
      url: result.url
    }))

    const response = await fetch(`${API_BASE_URL}/api/v1/memories/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memoryData)
    })
    
    return response.json()
  }
}