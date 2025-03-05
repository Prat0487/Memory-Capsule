import express from 'express';
import cors from 'cors';
import blockchainRoutes from './routes/blockchain-routes.js';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Mount routes at /api/blockchain - this is critical!
app.use('/api/blockchain', blockchainRoutes);

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'blockchain-service' });
});

app.listen(PORT, () => {
  console.log(`Blockchain service running on port ${PORT}`);
});