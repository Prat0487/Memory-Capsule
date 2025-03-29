import { create } from 'ipfs-http-client';

// Connect to local or dedicated IPFS node
const ipfs = create({ 
  host: process.env.IPFS_HOST || 'localhost',
  port: process.env.IPFS_PORT || '5001',
  protocol: process.env.IPFS_PROTOCOL || 'http'
});

export async function fetchFromIPFS(cid) {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error fetching from IPFS node:', error);
    throw error;
  }
}
