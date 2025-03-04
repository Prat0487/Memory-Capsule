import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:3001';

export const generateNarrative = async (description) => {
  try {
    console.log(`Requesting narrative generation for: "${description.substring(0, 30)}..."`);
    
    const response = await axios.post(`${AI_SERVICE_URL}/api/generate-narrative`, {
      description
    }, {
      timeout: 15000 // 15 second timeout
    });
    
    if (response.data && response.data.narrative) {
      console.log('Narrative generated successfully');
      return response.data.narrative;
    }
    
    console.log('Received empty narrative from AI service');
    return '';
  } catch (error) {
    console.error(`AI service error: ${error.message}`);
    return '';
  }
};
