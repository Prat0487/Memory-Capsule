import express from 'express';
import passport from 'passport';

const router = express.Router();

// Initiate Google authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  // Google callback route
  router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      // Change this to port 3006
      const redirectUrl = `http://localhost:3006/auth-callback?token=${req.user.token}`;
      res.redirect(redirectUrl);
    }
  );export default router;
