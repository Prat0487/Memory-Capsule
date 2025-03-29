// Create a new file for narrative generation
export function generateNarrative(description) {
  const narratives = [
    "This captured moment represents more than just an image - it embodies the emotions, connections, and unique experiences that shape your personal journey.",
    "Some moments deserve to be treasured forever. This memory, preserved in your digital time capsule, will remain a beacon of that special feeling.",
    "The power of memory lies in its ability to transcend time, bringing emotions and connections back to life whenever you revisit this preserved moment."
  ];
  
  // Select a narrative based on string length for consistency
  const index = Math.abs(description.length % narratives.length);
  return narratives[index];
}
