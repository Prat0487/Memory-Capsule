// Current implementation (problematic):
async function uploadEnhancedImageToIPFS(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // This is the problematic line - incorrect URL
    const response = await axios.post('/upload', {
      image: base64Image,
      name: path.basename(imagePath)
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading to IPFS:', error.message);
    throw error;
  }
}

// FIX: Use correct service URL with proper Docker network reference
async function uploadEnhancedImageToIPFS(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Create form data for multipart upload (matches how IPFS service expects it)
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: path.basename(imagePath),
      contentType: 'image/jpeg'
    });
    
    // Use the Docker service name and port
    const response = await axios.post('http://ipfs-service:3002/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('IPFS upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading to IPFS:', error.message);
    throw error;
  }
}
