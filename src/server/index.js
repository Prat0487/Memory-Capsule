import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const supabase = createClient(
  'https://lsijhlxvtztpjdvyjnwl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWpobHh2dHp0cGpkdnlqbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjkyNjMsImV4cCI6MjA1NjAwNTI2M30.cyoRUValV1tW4JpnW8A-5NPJ4luVjybhj8RjaZQ4_rI'
)

app.use(cors())
app.use(express.json())

// Create memories endpoint with detailed error logging
app.post('/api/v1/memories/create', async (req, res) => {
  try {
    console.log('Received memory data:', req.body)
    
    const { data, error } = await supabase
      .from('memories')
      .insert(req.body)
      .select()
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log('Created memories:', data)
    res.json({ success: true, memories: data })
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ 
      error: error.message,
      details: error.details || 'No additional details'
    })
  }
})

// Get memories endpoint with error handling
app.get('/api/v1/memories', async (req, res) => {
  try {
    console.log('Fetching memories for owner:', req.query.owner)
    
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('ownerAddress', req.query.owner)
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log('Found memories:', data)
    res.json({ success: true, memories: data })
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ 
      error: error.message,
      details: error.details || 'No additional details'
    })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
  console.log('Supabase connection initialized')
})

CREATE TABLE memories (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    ipfsHash TEXT NOT NULL,
    type TEXT NOT NULL,
    ownerAddress TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
