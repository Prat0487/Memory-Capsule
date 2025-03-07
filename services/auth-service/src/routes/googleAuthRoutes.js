import express from 'express';
import passport from 'passport';

const router = express.Router();

// Initiate Google authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Create a URL with the token for the frontend to parse
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-callback?token=${req.user.token}`;
    res.redirect(redirectUrl);
  }
);

export default router;
