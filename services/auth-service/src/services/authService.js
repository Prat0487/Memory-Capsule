import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabaseClient.js';
import { ethers } from 'ethers';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Traditional email/password authentication
export const registerUser = async (email, password, name) => {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Store user in Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        { email, password: hashedPassword, name, auth_type: 'email' }
      ])
      .select();
      
    if (error) throw error;
    
    // Create JWT token
    const user = data[0];
    const token = generateToken(user);
    
    return { user: sanitizeUser(user), token };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    // Find user
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error || !data) throw new Error('User not found');
    
    // Verify password
    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) throw new Error('Invalid credentials');
    
    // Generate token
    const token = generateToken(data);
    
    return { user: sanitizeUser(data), token };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Web3 wallet authentication
export const authenticateWallet = async (address, signature, nonce) => {
  try {
    // Verify the signature
    const signerAddress = ethers.utils.verifyMessage(`Login to Memory Capsule with nonce: ${nonce}`, signature);
    
    if (signerAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error('Invalid signature');
    }
    
    // Find or create user
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', address)
      .single();
      
    if (!user) {
      // Create new user with wallet
      const { data, error } = await supabase
        .from('users')
        .insert([{ 
          wallet_address: address, 
          auth_type: 'wallet',
          email: `${address.substring(0, 8)}@wallet.user` // Placeholder email
        }])
        .select();
        
      if (error) throw error;
      user = data[0];
    }
    
    // Generate token
    const token = generateToken(user);
    
    return { user: sanitizeUser(user), token };
  } catch (error) {
    console.error('Wallet authentication error:', error);
    throw error;
  }
};

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, wallet: user.wallet_address },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

// Verification middleware
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
