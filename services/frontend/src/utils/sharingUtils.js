/**
 * Utility that ONLY returns IPFS URLs, removing app URL fallback
 */
export const getShareableUrl = (memory) => {
  if (memory && memory.ipfsHash) {
    return `https://ipfs.io/ipfs/${memory.ipfsHash}`;
  }
  
  // Log an error instead of falling back
  console.error('Warning: Memory missing IPFS hash:', memory?.id);
  // Return a placeholder message for debugging
  return `Error: No IPFS hash available for memory ${memory?.id}`;
};

/**
 * Get multiple gateway URLs for an IPFS hash
 */
export const getIpfsGatewayUrls = (ipfsHash) => {
  if (!ipfsHash) return [];
  
  return [
    { name: 'IPFS.io', url: `https://ipfs.io/ipfs/${ipfsHash}` },
    { name: 'Cloudflare', url: `https://cloudflare-ipfs.com/ipfs/${ipfsHash}` },
    { name: 'Pinata', url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}` },
    { name: 'Dweb', url: `https://dweb.link/ipfs/${ipfsHash}` }
  ];
};
