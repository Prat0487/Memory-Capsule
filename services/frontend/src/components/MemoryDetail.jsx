// Import the tracking function
import { trackMemoryShare } from '../utils/sharing.js';

// In your share handler function:
const handleShare = async () => {
  // Create the shareable link
  const shareableLink = generateShareableLink(memory.ipfsHash, memory.id);
  
  // Copy to clipboard
  await navigator.clipboard.writeText(shareableLink);
  
  // Track the share event
  await trackMemoryShare(memory.id, memory.ipfsHash);
  
  // Show success message to user
  setShareNotification('Link copied to clipboard!');
  setTimeout(() => setShareNotification(''), 3000);
};
