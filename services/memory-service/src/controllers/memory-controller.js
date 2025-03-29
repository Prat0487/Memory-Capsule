// Add robust background processing with queue system

import Queue from 'bull';
const enhancementQueue = new Queue('image-enhancement', process.env.REDIS_URL || 'redis://redis:6379');
const narrativeQueue = new Queue('narrative-generation', process.env.REDIS_URL || 'redis://redis:6379');

// Queue processors
enhancementQueue.process(async (job) => {
  const { memoryId, ipfsHash, description } = job.data;
  
  try {
    console.log(`Processing enhancement for memory ${memoryId}`);
    // Make request to AI service for enhancement
    // Add retry logic here
    // Update memory in database with enhanced image hash
    return { success: true };
  } catch (error) {
    console.error(`Enhancement failed for memory ${memoryId}:`, error);
    return { success: false, error: error.message };
  }
});

// Add to your memory creation endpoint:
app.post('/memories/create', upload.array('files'), async (req, res) => {
  // Existing memory creation logic...
  
  // Then add background processing
  if (req.body.enhanceImage === 'true') {
    enhancementQueue.add({
      memoryId: newMemory.id,
      ipfsHash: ipfsHash,
      description: req.body.description
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
  }
  
  // Similarly for narrative generation
});

// Current implementation (problematic):
async function updateMemoryWithEnhancedImage(memoryId, enhancedData) {
  // Directly updating without checking if enhancement succeeded
  await supabase.from('memories').update({ /* data */ });
  console.log(`Successfully updated memory ${memoryId} with enhanced image`);
}

// Fix: Validate enhancement success before updating
async function updateMemoryWithEnhancedImage(memoryId, enhancementResult) {
  try {
    // Extract the direct URL from the AI service response
    const { enhancedImageUrl } = enhancementResult;
    
    if (!enhancedImageUrl) {
      console.warn(`No enhanced image URL for memory ${memoryId}`);
      return false;
    }
    
    // Build the full URL to the AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:3001';
    const fullEnhancedImageUrl = `${aiServiceUrl}${enhancedImageUrl}`;
    
    // Update the memory record with the direct URL
    const { data, error } = await supabase
      .from('memories')
      .update({
        enhancedImageUrl: fullEnhancedImageUrl,
        hasEnhancedVersion: true
      })
      .eq('id', memoryId);
      
    if (error) {
      throw new Error(`Failed to update memory: ${error.message}`);
    }
    
    console.log(`Successfully updated memory ${memoryId} with enhanced image URL`);
    return true;
  } catch (error) {
    console.error(`Error updating memory: ${error.message}`);
    return false;
  }
}
