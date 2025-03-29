// src/services/blockchain.js
import { supabase } from './config/supabaseClient.js';

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
  try {
    // Update the shareCount in the database
    const { data, error } = await supabase
      .from('memories')
      .update({ shareCount: supabase.raw('shareCount + 1') })
      .eq('id', memoryId)
      .select();
    
    if (error) throw error;
    
    console.log('Memory shared:', memoryId, 'New share count:', data[0]?.shareCount);
    return true;
  } catch (error) {
    console.error('Error tracking memory share:', error);
    return false;
  }
};

export const updateMemoryWithEnhancedImage = async (memoryId, enhancedImageData) => {
  const { enhancedIpfsHash, imageUrl, isLocal } = enhancedImageData;
  
  try {
    const { data, error } = await supabase
      .from('memories')
      .update({ 
        enhancedImageHash: enhancedIpfsHash,
        enhancedImageUrl: imageUrl,
        isLocalEnhancement: isLocal || false,
        updatedAt: new Date().toISOString()
      })
      .eq('id', memoryId)
      .select();
    
    if (error) {
      console.error('Error updating memory with enhanced image:', error);
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error('Error updating memory with enhanced image:', error);
    throw error;
  }
};