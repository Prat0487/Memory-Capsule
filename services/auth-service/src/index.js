import express from 'express';
import cors from 'cors';
import { initializeStorage, verifyAccess } from './auth.js';
import { connectWallet, verifyWalletConnection } from './wallet.js';

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/connect', async (req, res) => {
  try {
    const walletInfo = await connectWallet();
    res.json({ success: true, wallet: walletInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/verify', async (req, res) => {
  try {
    const isValid = await verifyAccess();
    res.json({ success: true, isValid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

export {
  initializeStorage,
  verifyAccess,
  connectWallet,
  verifyWalletConnection
};
