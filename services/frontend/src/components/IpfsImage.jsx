// Create a new file: services/frontend/src/components/IpfsImage.jsx
import React, { useState, useEffect } from 'react';

const IpfsImage = ({ hash, alt, className }) => {
  const [src, setSrc] = useState('');
  const [error, setError] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);
  
  const gateways = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
    'https://ipfs.infura.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/'
  ];
  
  useEffect(() => {
    if (hash) {
      setSrc(`${gateways[gatewayIndex]}${hash}`);
    }
  }, [hash, gatewayIndex]);
  
  const handleError = () => {
    if (gatewayIndex < gateways.length - 1) {
      setGatewayIndex(gatewayIndex + 1);
    } else {
      setError(true);
    }
  };
  
  if (!hash || error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No image available</span>
      </div>
    );
  }
  
  return (
    <img 
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default IpfsImage;
