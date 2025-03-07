/**
 * Track memory share event in the blockchain
 * @param {string} memoryId - The ID of the shared memory
 * @param {string} ipfsHash - The IPFS hash of the memory (if available)
 * @returns {Promise<boolean>} Success status
 */
export async function trackMemoryShare(memoryId, ipfsHash = null) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BLOCKCHAIN_URL}/api/blockchain/track-share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memoryId,
        ipfsHash,
        sharedAt: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      console.error('Error tracking share:', await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to track memory share:', error);
    return false;
  }
}
