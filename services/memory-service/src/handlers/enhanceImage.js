// Update the validation function in the memory service
function isValidEnhancement(originalHash, enhancedData) {
  // Log what we're checking for debugging
  console.log('Validating enhancement:');
  console.log(`- Original hash: ${originalHash}`);
  console.log(`- Enhanced data:`, JSON.stringify(enhancedData, null, 2));
  
  // First, check if we have a valid enhancedIpfsHash that's different from the original
  if (!enhancedData.enhancedIpfsHash) {
    console.log('No enhanced hash provided');
    return false;
  }
  
  if (enhancedData.enhancedIpfsHash === originalHash) {
    console.log('Enhanced hash matches original hash, not a valid enhancement');
    return false;
  }
  
  // Additional checks if needed
  if (enhancedData.isLocalStorage) {
    // For local storage, we need a valid URL
    if (!enhancedData.enhancedImageUrl || !enhancedData.enhancedImageUrl.startsWith('/local-image/')) {
      console.log('Invalid local storage URL');
      return false;
    }
  } else {
    // For IPFS, the hash should start with 'bafy' or another valid IPFS prefix
    if (!enhancedData.enhancedIpfsHash.startsWith('bafy')) {
      console.log('Invalid IPFS hash format');
      return false;
    }
  }
  
  console.log('Enhancement validation passed!');
  return true;
}

// Update the memory enhancement handler
async function updateMemoryWithEnhancement(memoryId, enhancementData, originalHash) {
  // Validate the enhancement data
  if (!isValidEnhancement(originalHash, enhancementData)) {
    console.log('No enhancement performed or same image returned, only using original image');
    return false;
  }
  
  try {
    // Update the memory with enhanced image information
    const result = await db.query(
      `UPDATE memories 
       SET enhanced_image_hash = $1, 
           enhanced_image_url = $2, 
           is_local_enhancement = $3,
           updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [
        enhancementData.enhancedIpfsHash,
        enhancementData.enhancedImageUrl,
        enhancementData.isLocalStorage || false,
        memoryId
      ]
    );
    
    if (result.rows.length > 0) {
      console.log(`Successfully updated memory ${memoryId} with enhanced image hash ${enhancementData.enhancedIpfsHash}`);
      return true;
    } else {
      console.log(`Failed to update memory ${memoryId}: record not found`);
      return false;
    }
  } catch (error) {
    console.error('Error updating memory with enhancement:', error);
    throw error;
  }
}
