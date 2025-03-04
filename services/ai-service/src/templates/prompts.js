export const narrativePrompts = {
  basic: (description) => `
    Generate a reflective, emotional narrative about this memory.
    
    Context: ${description}
    
    Create 3-4 sentences that capture the emotional significance of this memory.
    Focus on the feelings, connections, and meaning rather than just describing what happened.
    Use a warm, thoughtful tone that evokes nostalgia and appreciation.
    
    Narrative:
  `,
  
  detailed: (description, imageContext = '') => `
    Create a meaningful narrative for a personal memory.
    
    Memory description: ${description}
    ${imageContext ? `Visual elements: ${imageContext}` : ''}
    
    Generate a thoughtful 4-5 sentence narrative that:
    - Captures the emotional essence of this moment
    - Reflects on its significance in a life journey
    - Uses sensory details to make the memory vivid
    - Maintains a personal, intimate perspective
    - Avoids clichés and generic statements
    
    Narrative:
  `
};
