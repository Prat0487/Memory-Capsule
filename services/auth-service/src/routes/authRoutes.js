import express from 'express';
import { registerUser, loginUser, authenticateWallet } from '../services/authService.js';
import { generateNonce, storeNonce } from '../services/nonceService.js';

const router = express.Router();

// Traditional auth routes
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const result = await registerUser(email, password, name);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Web3 wallet auth routes
router.get('/nonce/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const nonce = generateNonce();
    
    await storeNonce(address, nonce);
    
    res.status(200).json({ nonce });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/wallet', async (req, res) => {
  try {
    const { address, signature, nonce } = req.body;
    
    if (!address || !signature || !nonce) {
      return res.status(400).json({ error: 'Address, signature and nonce required' });
    }
    
    const result = await authenticateWallet(address, signature, nonce);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Verification route
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
