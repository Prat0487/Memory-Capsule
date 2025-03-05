import axios from 'axios';

export async function generateNarrative(description) {
  try {
    // Use mock response for immediate implementation
    // This ensures you get a narrative even if AI service isn't ready
    console.log('Generating narrative for memory...');
    
    // This will work immediately without requiring AI service to be running
    return "The golden sunlight filtered through the garden as three generations witnessed a miracle. Emma's first steps weren't just a child's milestone but a powerful symbol of continuity and growth. The tears in grandmother's eyes, the pride in Emma's laugh - these moments transcend the ordinary, becoming the treasured memories that define what family truly means.";
  } catch (error) {
    console.error('Narrative generation error:', error);
    return '';
  }
}
