// Modify the image enhancement endpoint
app.post('/enhance-image', async (req, res) => {
  try {
    const { ipfsHash, description, memoryId } = req.body;
    
    // Fetch the original image (using your existing code)
    const imageBuffer = await fetchImageFromIPFS(ipfsHash);
    
    // Get AI enhancement parameters and enhance the image
    const enhancementParams = await getAIEnhancementParams(description);
    const enhancedImageBuffer = await enhanceImage(imageBuffer, enhancementParams);
    
    // Generate a unique filename
    const filename = `enhanced_${memoryId}_${Date.now()}.jpg`;
    const filePath = path.join(__dirname, '../public/enhanced-images', filename);
    
    // Save the enhanced image to the public directory
    await fs.promises.writeFile(filePath, enhancedImageBuffer);
    
    // Return the direct URL to access this image
    const enhancedImageUrl = `/enhanced-images/${filename}`;
    
    // Return both the original IPFS hash and the direct URL
    res.json({
      success: true,
      originalIpfsHash: ipfsHash,
      enhancedImageUrl: enhancedImageUrl
    });
  } catch (error) {
    console.error('Error enhancing image:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      originalIpfsHash: ipfsHash // Return original hash on error
    });
  }
});
