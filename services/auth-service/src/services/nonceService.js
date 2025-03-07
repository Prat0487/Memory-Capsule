import crypto from 'crypto';

// In-memory store for nonces - in production, use Redis or another persistent store
const nonceStore = new Map();

/**
 * Generates a cryptographically secure random nonce
 * @returns {string} A hex string nonce
 */
export const generateNonce = () => {
  // Generate a 32-byte random value and convert to hex
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Store a nonce for a specific wallet address
 * @param {string} address - Wallet address
 * @param {string} nonce - The nonce to store
 * @returns {Promise<boolean>} Success indicator
 */
export const storeNonce = async (address, nonce) => {
  try {
    // Store nonce with expiration (10 minutes)
    nonceStore.set(address.toLowerCase(), {
      value: nonce,
      expires: Date.now() + 600000 // 10 minutes
    });
    return true;
  } catch (error) {
    console.error('Failed to store nonce:', error);
    return false;
  }
};

/**
 * Verify and consume a nonce
 * @param {string} address - Wallet address
 * @param {string} nonce - The nonce to verify
 * @returns {boolean} Whether the nonce is valid
 */
export const verifyNonce = (address, nonce) => {
  try {
    const storedNonceData = nonceStore.get(address.toLowerCase());
    
    // Check if nonce exists and hasn't expired
    if (!storedNonceData || Date.now() > storedNonceData.expires) {
      return false;
    }
    
    // Check if nonces match
    const isValid = storedNonceData.value === nonce;
    
    // Consume the nonce by removing it (one-time use)
    if (isValid) {
      nonceStore.delete(address.toLowerCase());
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying nonce:', error);
    return false;
  }
};

/**
 * Clean up expired nonces
 */
export const cleanupExpiredNonces = () => {
  const now = Date.now();
  for (const [address, nonceData] of nonceStore.entries()) {
    if (now > nonceData.expires) {
      nonceStore.delete(address);
    }
  }
};

// Setup automatic cleanup every hour
setInterval(cleanupExpiredNonces, 3600000);
