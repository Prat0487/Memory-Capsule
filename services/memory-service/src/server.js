const express = require('express');
const cors = require('cors');
const { createMemory, getMemories } = require('./index');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Create memory endpoint
app.post('/memories/create', async (req, res) => {
  try {
    const memory = await createMemory(req.body);
    res.json({ success: true, memory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get memories endpoint
app.get('/memories/:address', async (req, res) => {
  try {
    const memories = await getMemories(req.params.address);
    res.json({ success: true, memories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Memory Service running on port ${PORT}`);
});
