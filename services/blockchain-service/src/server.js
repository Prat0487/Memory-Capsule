import express from 'express';
import cors from 'cors';
import trackingRoutes from './routes/tracking.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount the routes - this ensures the path is /api/blockchain/track-share
app.use('/api/blockchain', trackingRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Blockchain service running on port ${PORT}`);
});