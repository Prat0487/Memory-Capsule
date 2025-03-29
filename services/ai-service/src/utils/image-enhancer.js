import sharp from 'sharp';
import { uploadToIPFS } from '../services/ipfs-service.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function enhanceImage(imageBuffer, enhancementParams = null) {
  try {
    // Use provided parameters or defaults
    const params = enhancementParams || {
      saturation: 1.2,
      contrast: 1.1, 
      brightness: 1.05,
      sharpness: 1.5
    };
    
    // Apply enhancements with sharp
    const enhancedImageBuffer = await sharp(imageBuffer)
      .modulate({ 
        brightness: params.brightness,
        saturation: params.saturation 
      })
      .gamma(params.contrast)
      .sharpen(params.sharpness)
      .jpeg({ quality: 85 })
      .toBuffer();
    
    // Save to temp location
    const tempFilename = `enhanced_${uuidv4()}.jpg`;
    const tempFilePath = path.join('/app/temp', tempFilename);
    
    await sharp(enhancedImageBuffer).toFile(tempFilePath);
    console.log(`Enhanced image saved to ${tempFilePath}`);
    
    // Upload to IPFS
    const result = await uploadToIPFS(tempFilePath, tempFilename);
    
    if (!result.success) {
      throw new Error(`Failed to upload to IPFS: ${result.error}`);
    }
    
    return {
      success: true,
      originalSize: imageBuffer.length,
      enhancedSize: enhancedImageBuffer.length,
      improvementPercent: (1 - (enhancedImageBuffer.length / imageBuffer.length)) * 100,
      ipfsHash: result.ipfsHash,
      url: result.url
    };
  } catch (error) {
    console.error('Image enhancement failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
