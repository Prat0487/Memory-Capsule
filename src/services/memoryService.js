import { uploadToIPFS } from './ipfs'

const API_BASE_URL = 'http://localhost:3000/api/v1'
  export class MemoryService {
    async createMemory(files, metadata) {
      const uploadResults = await uploadToIPFS(files)

      // Use 'result.cid' from ipfs.js
      const memoryData = uploadResults.map(result => ({
        title: metadata.title,
        description: metadata.description,
        ipfsHash: result.cid,            // <-- fix here
        type: files[0].type?.split('/')[0] || 'image',
        ownerAddress: metadata.ownerAddress, 
        url: `https://gateway.pinata.cloud/ipfs/${result.cid}`
      }))

      const response = await fetch(`${API_BASE_URL}/memories/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memoryData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create memory')
      }

      return response.json()
    }
  async getMemories(ownerAddress) {
    try {
      const response = await fetch(`${API_BASE_URL}/memories?owner=${ownerAddress}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch memories')
      }

      return response.json()
    } catch (error) {
      console.error('Memory fetch error:', error)
      throw error
    }
  }
}
