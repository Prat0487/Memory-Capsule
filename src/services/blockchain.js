// src/services/blockchain.js
import { createClient } from '@supabase/supabase-js';

// Use the Supabase credentials from your existing codebase
const supabaseUrl = 'https://lsijhlxvtztpjdvyjnwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWpobHh2dHp0cGpkdnlqbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjkyNjMsImV4cCI6MjA1NjAwNTI2M30.cyoRUValV1tW4JpnW8A-5NPJ4luVjybhj8RjaZQ4_rI';
const supabase = createClient(supabaseUrl, supabaseKey);

export const mintMemoryNFT = async (memoryData) => {
  const { data, error } = await supabase
    .from('memories')
    .insert([{ 
      ...memoryData,
      createdAt: new Date().toISOString(),
      shareCount: 0
    }])
    .select();
    
  if (error) {
    console.error('Error minting memory:', error);
    throw error;
  }
  
  return {
    tokenId: data[0].id,
    transactionHash: 'supabase-tx-' + Math.random().toString(36).substring(2, 15)
  };
};

export const getMemories = async (address) => {
  let query = supabase.from('memories').select('*');
  
  // If address is provided, filter by owner
  if (address) {
    query = query.eq('ownerAddress', address);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching from Supabase:', error);
    return [];
  }
  
  return data || [];
};

export const verifyOwnership = async (tokenId, address) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
};

export const getMemoryById = async (id) => {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching memory by ID:', error);
    return null;
  }
  
  return data;
};

export const trackMemoryShare = async (memoryId) => {
  // First get the current memory to update share count
  const { data: memory } = await supabase
    .from('memories')
    .select('shareCount')
    .eq('id', memoryId)
    .single();
    
  const currentCount = memory?.shareCount || 0;
  
  // Update the share count
  const { error } = await supabase
    .from('memories')
    .update({ shareCount: currentCount + 1 })
    .eq('id', memoryId);
    
  if (error) {
    console.error('Error tracking memory share:', error);
    return false;
  }
  
  return true;
};
