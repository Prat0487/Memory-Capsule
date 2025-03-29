// Update or create this validation function
function isValidEnhancement(originalHash, enhancementData) {
  // Add detailed logging for troubleshooting
  console.log('Enhancement validation:');
  console.log(`- Original hash: "${originalHash}"`);
  console.log(`- Enhanced data:`, JSON.stringify(enhancementData, null, 2));
  
  // Check if we have the required fields
  if (!enhancementData || !enhancementData.enhancedIpfsHash) {
    console.warn('Missing enhancedIpfsHash in enhancement data');
    return false;
  }
  
  // CRITICAL FIX: Ensure strings are trimmed for comparison
  const originalTrimmed = originalHash.trim();
  const enhancedTrimmed = enhancementData.enhancedIpfsHash.trim();
  
  // Debug log the trimmed values
  console.log(`- Trimmed original: "${originalTrimmed}"`);
  console.log(`- Trimmed enhanced: "${enhancedTrimmed}"`);
  
  // Compare the hashes after trimming
  if (originalTrimmed === enhancedTrimmed) {
    console.warn('Enhanced hash matches original hash after trimming');
    return false;
  }
  
  console.log('Enhancement validation passed: hashes are different');
  return true;
}

// Then update your enhancement handler function
async function updateMemoryWithEnhancement(memoryId, enhancementData, originalHash) {
  console.log(`Attempting to update memory ${memoryId} with enhancement`);
  
  if (!isValidEnhancement(originalHash, enhancementData)) {
    console.log('No enhancement performed or same image returned');
    return false;
  }
  
  try {
    // Update the memory with enhanced image information
    const enhancedHash = enhancementData.enhancedIpfsHash.trim();
    const enhancedUrl = enhancementData.enhancedImageUrl || 
                        `https://gateway.pinata.cloud/ipfs/${enhancedHash}`;
    
    console.log(`Updating memory ${memoryId} with enhanced hash: ${enhancedHash}`);
    
    const result = await db.query(
      `UPDATE memories 
       SET enhanced_image_hash = $1, 
           enhanced_image_url = $2,
           updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [enhancedHash, enhancedUrl, memoryId]
    );
    
    if (result.rows.length > 0) {
      console.log(`Successfully updated memory ${memoryId} with enhanced image`);
      return true;
    } else {
      console.warn(`Failed to update memory ${memoryId}, record not found`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating memory ${memoryId}:`, error);
    return false;
  }
}
