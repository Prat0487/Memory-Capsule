import React, { useState, useEffect } from 'react';
import { enhanceImage } from '../services/aiService';

export const EnhanceImageModal = ({ imageFile, onEnhancementComplete }) => {
  const [originalPreview, setOriginalPreview] = useState('');
  const [enhancedPreview, setEnhancedPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('enhanced');
  
  useEffect(() => {
    // Show original preview
    const reader = new FileReader();
    reader.onload = (e) => setOriginalPreview(e.target.result);
    reader.readAsDataURL(imageFile);
    
    // Request enhancement
    handleEnhance();
  }, [imageFile]);
  
  const handleEnhance = async () => {
    setIsLoading(true);
    try {
      const result = await enhanceImage(imageFile);
      setEnhancedPreview(result.enhancedImageUrl);
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="enhancement-modal">
      <h2>Enhance Your Memory</h2>
      
      <div className="preview-container">
        <div className="preview-card">
          <h3>Original</h3>
          <img src={originalPreview} alt="Original" />
          <button 
            onClick={() => setSelectedVersion('original')}
            className={selectedVersion === 'original' ? 'selected' : ''}
          >
            Use Original
          </button>
        </div>
        
        <div className="preview-card">
          <h3>Enhanced</h3>
          {isLoading ? (
            <div className="loading-spinner">Enhancing...</div>
          ) : (
            <img src={enhancedPreview} alt="Enhanced" />
          )}
          <button 
            onClick={() => setSelectedVersion('enhanced')}
            className={selectedVersion === 'enhanced' ? 'selected' : ''}
            disabled={isLoading}
          >
            Use Enhanced
          </button>
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          className="primary-button"
          onClick={() => onEnhancementComplete({
            selectedVersion,
            originalUrl: originalPreview,
            enhancedUrl: enhancedPreview
          })}
          disabled={isLoading}
        >
          Create NFT Memory
        </button>
      </div>
    </div>
  );
};
