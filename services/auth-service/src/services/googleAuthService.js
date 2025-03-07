import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { supabase } from '../config/supabaseClient.js';
import { generateToken } from './authService.js';
import oauthConfig from '../config/oauth.js';

export const setupGoogleAuth = () => {
  passport.use(new GoogleStrategy({
    clientID: oauthConfig.google.clientID,
    clientSecret: oauthConfig.google.clientSecret,
    callbackURL: oauthConfig.google.callbackURL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', profile.emails[0].value)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let user;
      
      if (existingUser) {
        // User exists, update login info if needed
        user = existingUser;
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            email: profile.emails[0].value,
            name: profile.displayName,
            auth_type: 'google',
            google_id: profile.id
          }])
          .select();
          
        if (createError) throw createError;
        user = newUser[0];
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      return done(null, { user, token });
    } catch (error) {
      console.error('Google auth error:', error);
      return done(error);
    }
  }));
  
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  // Deserialize user from session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

export const configureGoogleRoutes = (app) => {
  // Google authentication route
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  // Google callback route
  app.get('/auth/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication
      const { token } = req.user;
      
      // In a real application, you might redirect to the frontend with the token
      res.redirect(`http://localhost:3001/auth-callback?token=${token}`);
    }
  );
};