const express = require('express');
const cors = require('cors');
const { mintMemoryNFT, getMemories } = require('./index');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Mint memory endpoint
app.post('/mint', async (req, res) => {
  try {
    const result = await mintMemoryNFT(req.body);
    res.json({ memory: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get memories endpoint
app.get('/memories/:address', async (req, res) => {
  try {
    const memories = await getMemories(req.params.address);
    res.json({ memories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Blockchain Service running on port ${PORT}`);
});
