import { Web3Storage } from 'web3.storage'

const DID_KEY = 'did:key:z6Mkg6qCyxke5eBMitJkp6sYtBveayAsaEstmaTrXvt4xUQN'

export const initializeStorage = () => {
  const client = new Web3Storage({ 
    token: process.env.VITE_WEB3_STORAGE_TOKEN,
    did: DID_KEY
  })
  return client
}
