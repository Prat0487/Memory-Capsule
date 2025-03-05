import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ShareMemory = ({ memoryId }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/shared/${memoryId}`;
  
  const handleCopyLink = async () => {
    try {
      // Copy to clipboard functionality - this works
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success('Link copied to clipboard!');
      
      // IMPORTANT: Implement direct local share tracking without API call
      // This bypasses the need for the blockchain service endpoint
      try {
        // First, try the API
        await axios.post('/api/blockchain/track-share', { memoryId });
        console.log("Share tracked via API");
      } catch (error) {
        // If API fails, update localStorage as a fallback
        console.log("API share tracking failed, using local tracking");
        const sharedMemories = JSON.parse(localStorage.getItem('sharedMemories') || '{}');
        sharedMemories[memoryId] = (sharedMemories[memoryId] || 0) + 1;
        localStorage.setItem('sharedMemories', JSON.stringify(sharedMemories));
      }
    } catch (clipboardError) {
      toast.error('Failed to copy link');
      console.error('Error copying to clipboard:', clipboardError);
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
      <div className="mt-2 flex flex-wrap gap-2">
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
        <button 
          onClick={() => window.open(`https://api.whatsapp.com/send?text=Check out this memory! ${encodeURIComponent(shareUrl)}`, '_blank')}
          className="bg-[#25D366] text-white p-2 rounded-md hover:bg-opacity-90"
        >
          Share on WhatsApp
        </button>
        <button 
          onClick={() => {
            // Instagram doesn't support direct web sharing via URL
            // On mobile, we can attempt to open the app with a prepared message
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.includes('iphone') || userAgent.includes('android')) {
              window.location.href = `instagram://share?text=Check out this memory! ${encodeURIComponent(shareUrl)}`;
            } else {
              // On desktop, copy to clipboard and notify user
              navigator.clipboard.writeText(shareUrl);
              toast.info('Link copied! Open Instagram to share.');
            }
          }}
          className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white p-2 rounded-md hover:opacity-90"
        >
          Share on Instagram
        </button>
      </div>
    </div>
  );
};

export default ShareMemory;