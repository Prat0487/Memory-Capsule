// Add a new endpoint to get a memory by its ID for public sharing
router.get('/api/memories/shared/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the memory from your storage (Supabase, blockchain mock, etc.)
    const memory = await getMemoryById(id);
    
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    
    // Return only public-safe information
    return res.status(200).json({
      id: memory.id,
      title: memory.title,
      description: memory.description,
      files: memory.files,
      createdAt: memory.createdAt,
      // Don't include owner wallet address or sensitive data
    });
  } catch (error) {
    console.error('Error fetching shared memory:', error);
    return res.status(500).json({ error: 'Failed to retrieve memory' });
  }
});
