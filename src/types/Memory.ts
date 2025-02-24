interface Memory {
  id?: string;
  title: string;
  description: string;
  ipfsHash: string;
  ownerAddress: string;
  createdAt: Date;
  type: 'image' | 'text' | 'audio';
}
