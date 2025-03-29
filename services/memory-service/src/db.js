import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

// Environment variables (these match your docker-compose.yml)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lsijhlxvtztpjdvyjnwl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWpobHh2dHp0cGpkdnlqbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjkyNjMsImV4cCI6MjA1NjAwNTI2M30.cyoRUValV1tW4JpnW8A-5NPJ4luVjybhj8RjaZQ4_rI';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// If you're using pg directly for some queries, set up a pool
const pool = new pg.Pool({
  connectionString: `postgres://postgres:postgres@${SUPABASE_URL.replace('https://', '')}:5432/postgres`,
  ssl: {
    rejectUnauthorized: false
  }
});

// Export the database query function
export const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect()
};

// Log successful connection
pool.on('connect', () => {
  console.log('Connected to the database');
});

// Log connection errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Export for use in other modules
export default {
  supabase,
  db
};
