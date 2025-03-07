import express from 'express';
import cors from 'cors';
import passport from 'passport';
import authRoutes from './routes/authRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import { setupGoogleAuth } from './services/googleAuthService.js';

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Setup authentication strategies
setupGoogleAuth();

// Routes
app.use('/auth', authRoutes);
app.use('/auth', googleAuthRoutes);

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});