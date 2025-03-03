import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ShareMemory = ({ memoryId }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/shared/${memoryId}`;
  
  const handleCopyLink = async () => {
    try {
      // First, copy to clipboard - this is the core functionality
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      // Show success toast immediately since clipboard operation worked
      toast.success('Link copied to clipboard!');
      
      // Try to track the share, but don't let failures affect user experience
      try {
        await axios.post('/api/blockchain/track-share', { memoryId });
        // Optional: console.log("Share tracked successfully");
      } catch (trackError) {
        // Silently handle tracking failures - don't show to user
        console.log("Share tracking unavailable - this won't affect functionality");
      }
    } catch (err) {
      // Only show error if the clipboard operation failed
      toast.error('Failed to copy link');
      console.error('Error copying to clipboard:', err);
    }
  };
  
  return (
    <div className="mt-4 flex flex-col items-start gap-2">
      <h3 className="text-lg font-medium">Share this memory</h3>
      <div className="flex w-full">
        <input 
          type="text" 
          value={shareUrl} 
          readOnly 
          className="flex-grow p-2 border rounded-l-md bg-gray-50 text-sm"
        />
        <button
          onClick={handleCopyLink}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors"
        >
          {isCopied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <button 
          onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this memory I preserved!`, '_blank')}
          className="bg-[#1DA1F2] text-white p-2 rounded-md hover:bg-opacity-90"
        >
          Share on Twitter
        </button>
        <button 
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
          className="bg-[#4267B2] text-white p-2 rounded-md hover:bg-opacity-90"
        >
          Share on Facebook
        </button>
      </div>
    </div>
  );
};

export default ShareMemory;