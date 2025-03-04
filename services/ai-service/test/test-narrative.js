import { generateBasicNarrative } from '../src/functions/narrative-generator.js';

// First, make sure your Node.js environment has the key file path set
process.env.GOOGLE_APPLICATION_CREDENTIALS = './vertex-ai-key.json';

const testNarrativeGeneration = async () => {
  const sampleDescriptions = [
    "My daughter's first birthday party with family gathered around the cake",
    "Hiking to the summit of Mount Rainier last summer"
  ];
  
  console.log('Starting narrative generation test...\n');
  
  for (const description of sampleDescriptions) {
    console.log(`Description: ${description}`);
    console.log('Generating narrative...');
    
    const startTime = Date.now();
    const narrative = await generateBasicNarrative(description);
    const duration = Date.now() - startTime;
    
    console.log(`Generated Narrative (${duration}ms): ${narrative}\n`);
  }
  
  console.log('Test completed successfully!');
};

testNarrativeGeneration().catch(console.error);
