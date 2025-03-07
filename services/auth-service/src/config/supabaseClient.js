import { createClient } from '@supabase/supabase-js';

// Using the same Supabase credentials as seen in other services
const supabaseUrl = 'https://lsijhlxvtztpjdvyjnwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWpobHh2dHp0cGpkdnlqbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjkyNjMsImV4cCI6MjA1NjAwNTI2M30.cyoRUValV1tW4JpnW8A-5NPJ4luVjybhj8RjaZQ4_rI';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
