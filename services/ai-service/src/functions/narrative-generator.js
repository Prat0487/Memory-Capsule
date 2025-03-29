import { getGenerativeModel } from '../clients/vertex-client.js';
import { narrativePrompts } from '../templates/prompts.js';

export const generateBasicNarrative = async (description) => {
  try {
    const model = getGenerativeModel();
    const prompt = narrativePrompts.basic(description);
    
    console.log(`Generating narrative for: "${description.substring(0, 30)}..."`);
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    // Extract the generated text from the response
    // The response structure has changed in newer versions of the API
    const response = result.response;
    const candidates = response.candidates || [];
    const parts = candidates[0]?.content?.parts || [];
    const generatedText = parts[0]?.text || '';
    
    // Post-process to clean up potential formatting issues
    const narrative = generatedText
      .replace(/^Narrative:|\s*Narrative:\s*/i, '')  // Remove any "Narrative:" prefix
      .replace(/\n{2,}/g, '\n')                     // Normalize line breaks
      .trim();
    
    return narrative;
  } catch (error) {
    console.error('Error generating narrative:', error);
    
    // Provide a fallback response rather than failing
    return "A cherished moment captured in time, preserving the emotions and connections that make life meaningful.";
  }
};
