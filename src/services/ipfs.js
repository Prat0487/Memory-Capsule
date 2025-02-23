import { create } from 'ipfs-http-client'

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
})

export async function uploadToIPFS(files) {
  const results = []
  
  for (const file of files) {
    const buffer = await file.arrayBuffer()
    const added = await ipfs.add(buffer)
    
    results.push({
      name: file.name,
      type: file.type,
      size: file.size,
      cid: added.cid.toString(),
      urls: [
        `https://ipfs.io/ipfs/${added.cid.toString()}`,
        `https://gateway.ipfs.io/ipfs/${added.cid.toString()}`,
        `https://cloudflare-ipfs.com/ipfs/${added.cid.toString()}`
      ]
    })
  }

  return results
}

export function getIPFSUrl(cid) {
  return `https://ipfs.io/ipfs/${cid}`
}
