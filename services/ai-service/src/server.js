
const express = require('express');
const cors = require('cors');
const { generateNarrative } = require('./index');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3003;

// Generate narrative endpoint
app.post('/generate', async (req, res) => {
  try {
    const narrative = await generateNarrative(
      req.body.description,
      req.body.files
    );
    res.json({ narrative });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
