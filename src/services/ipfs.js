import * as Client from '@web3-storage/w3up-client'

// Constants for our spaces
const MEMORY_CAPSULE_DID = 'did:key:z6Mkg6qCyxke5eBMitJkp6sYtBveayAsaEstmaTrXvt4xUQN'
const USER_DID = 'did:key:z6MksEZZFoeCue7WirHTwB4JuRuCjR5psyKU3mLsPMLD8Ten'

export async function initializeStorage() {
  // Create client instance
  const client = await Client.create()
  
  // Login with your email
  await client.login('praras5.pr@gmail.com')
  
  // Get Memory_Capsule space
  const spaces = await client.spaces()
  const memorySpace = spaces.find(space => space.did() === MEMORY_CAPSULE_DID)
  
  // Set as current space
  await client.setCurrentSpace(memorySpace)
  
  return client
}

export async function uploadToIPFS(files) {
  const client = await initializeStorage()
  const results = []

  for (const file of files) {
    try {
      const cid = await client.uploadFile(file)
      results.push({
        name: file.name,
        type: file.type,
        size: file.size,
        cid: cid.toString(),
        url: `https://w3s.link/ipfs/${cid}`,
        space: MEMORY_CAPSULE_DID
      })
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
    }
  }

  return results
}

export const retrieveFromIPFS = async (hash) => {
  try {
    const response = await fetch(`https://ipfs.io/ipfs/${hash}`)
    return response
  } catch (error) {
    throw new Error(`Failed to retrieve file: ${error.message}`)
  }
}

export const pinContent = async (hash) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, hash });
    }, 500);
  });
};