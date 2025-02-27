const express = require('express');
const cors = require('cors');
const { 
  initializeStorage, 
  verifyAccess,
  connectWallet,
  verifyWalletConnection
} = require('./index');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;

// Verify access endpoint
app.get('/verify', (req, res) => {
  const isValid = verifyAccess();
  res.json({ isValid });
});

// Initialize storage endpoint
app.get('/storage', (req, res) => {
  const storage = initializeStorage();
  res.json(storage);
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
