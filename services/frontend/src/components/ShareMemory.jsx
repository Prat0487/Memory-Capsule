import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getShareableUrl, getIpfsGatewayUrls } from '../utils/sharingUtils';

function ShareMemory({ memory }) {
  // Add console logging to debug
  console.log("ShareMemory received memory:", memory);
  console.log("Has ipfsHash:", Boolean(memory && memory.ipfsHash));
  
  const [isCopied, setIsCopied] = useState(false);
  
  const shareUrl = memory.ipfsHash 
    ? `https://ipfs.io/ipfs/${memory.ipfsHash}`
    : `${window.location.origin}/shared/${memory.id}`;
  
  const handleCopyLink = () => {
    const shareUrl = getShareableUrl(memory);
    navigator.clipboard.writeText(shareUrl);
    
    // Show appropriate message
    if (memory && memory.ipfsHash) {
      toast.success('IPFS link copied to clipboard!');
    } else {
      toast.success('Link copied to clipboard!');
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSocialShare = (platform) => {
    const shareUrl = getShareableUrl(memory);
    
    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=Check out this memory! ${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'instagram':
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('iphone') || userAgent.includes('android')) {
          window.location.href = `instagram://share?text=Check out this memory! ${encodeURIComponent(shareUrl)}`;
        } else {
          navigator.clipboard.writeText(shareUrl);
          toast.info('Link copied! Open Instagram to share.');
        }
        break;
      default:
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
    }
  };
  
  return (
    <div className="share-options p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-md font-medium text-gray-800 mb-3">Share this memory</h3>
      
      {/* Add logging to show if ipfsHash exists */}
      <p className="text-xs text-gray-500 mb-2">
        {memory && memory.ipfsHash ? 
          `Using IPFS hash: ${memory.ipfsHash.substring(0, 12)}...` : 
          'No IPFS hash available, using app URL'}
      </p>
      
      <div className="flex space-x-2 mb-3">
        <button
          onClick={handleCopyLink}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
        >
          {isCopied ? 'Copied!' : 'Copy Link'}
        </button>
        
        {/* Social buttons */}
        <button 
          onClick={() => handleSocialShare('twitter')}
          className="bg-[#1DA1F2] text-white p-2 rounded-md hover:bg-opacity-90"
        >
          Share on Twitter
        </button>
        <button 
          onClick={() => handleSocialShare('facebook')}
          className="bg-[#4267B2] text-white p-2 rounded-md hover:bg-opacity-90"
        >
          Share on Facebook
        </button>
        <button 
          onClick={() => handleSocialShare('whatsapp')}
          className="bg-[#25D366] text-white p-2 rounded-md hover:bg-opacity-90"
        >
          Share on WhatsApp
        </button>
        <button 
          onClick={() => handleSocialShare('instagram')}
          className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white p-2 rounded-md hover:opacity-90"
        >
          Share on Instagram
        </button>
      </div>
    </div>
  );
}
export default ShareMemory;