// Add status tracking component

import React, { useState, useEffect } from 'react';

function EnhancementStatus({ memoryId }) {
  const [status, setStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!memoryId) return;
    
    // Poll for status every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/enhancement-status/${memoryId}`);
        const data = await response.json();
        
        setStatus(data.status);
        setProgress(data.progress);
        
        if (['completed', 'failed'].includes(data.status)) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking enhancement status:', error);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [memoryId]);
  
  return (
    <div className="enhancement-status">
      <h3>Enhancement Status: {status}</h3>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      {status === 'failed' && (
        <p className="error">Enhancement failed. Your memory is still available with the original image.</p>
      )}
    </div>
  );
}
