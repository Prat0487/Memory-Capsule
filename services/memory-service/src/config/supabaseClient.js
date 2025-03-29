import { createClient } from '@supabase/supabase-js';

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lsijhlxvtztpjdvyjnwl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWpobHh2dHp0cGpkdnlqbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjkyNjMsImV4cCI6MjA1NjAwNTI2M30.cyoRUValV1tW4JpnW8A-5NPJ4luVjybhj8RjaZQ4_rI';

// Initialize the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Export default for convenience
export default supabase;

// Log connection info for debugging
console.log(`Supabase client initialized with URL: ${SUPABASE_URL}`);
