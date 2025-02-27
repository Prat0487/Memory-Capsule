const express = require('express');
const cors = require('cors');
const ipfsService = require('./index');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

// Upload endpoint
app.post('/upload', async (req, res) => {
  try {
    const result = await ipfsService.uploadToIPFS(req.body.files);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`IPFS Service running on port ${PORT}`);
});
