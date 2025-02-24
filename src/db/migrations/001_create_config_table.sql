CREATE TABLE app_config (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(50) NOT NULL UNIQUE,
    key_value TEXT NOT NULL,
    key_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Insert the configuration values
INSERT INTO app_config (key_name, key_value, key_type, description) VALUES
(
    'SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWpobHh2dHp0cGpkdnlqbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjkyNjMsImV4cCI6MjA1NjAwNTI2M30.cyoRUValV1tW4JpnW8A-5NPJ4luVjybhj8RjaZQ4_rI',
    'auth',
    'Supabase anonymous public key'
),
(
    'SUPABASE_SERVICE_ROLE_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWpobHh2dHp0cGpkdnlqbndsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDQyOTI2MywiZXhwIjoyMDU2MDA1MjYzfQ.yB_ku0Da4qgyL1nemsWmRywGinydo6wTJk-K123MypI',
    'auth',
    'Supabase service role secret key'
),
(
    'SUPABASE_PROJECT_URL',
    'https://lsijhlxvtztpjdvyjnwl.supabase.co',
    'url',
    'Supabase project URL'
),
(
    'SUPABASE_API_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWpobHh2dHp0cGpkdnlqbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjkyNjMsImV4cCI6MjA1NjAwNTI2M30.cyoRUValV1tW4JpnW8A-5NPJ4luVjybhj8RjaZQ4_rI',
    'auth',
    'Supabase API key'
);
