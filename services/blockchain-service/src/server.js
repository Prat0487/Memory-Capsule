import express from 'express';
import cors from 'cors';
import trackingRoutes from './routes/tracking.js';
import blockchainRoutes from './routes/blockchain.js';
import { supabase } from './config/supabaseClient.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Check database connection
app.get('/api/blockchain/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('memories').select('id').limit(1);
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({ 
      status: 'healthy',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

// Routes
app.use(blockchainRoutes);
app.use('/api/blockchain', trackingRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Blockchain service running on port ${PORT}`);
});