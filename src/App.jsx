// src/App.jsx
import React from 'react';
import { UserProvider } from './context/UserContext';
import WalletConnect from './components/auth/WalletConnect';
import MemoryCapsuleCreate from './components/memory/MemoryCapsuleCreate';
import MemoryCapsuleView from './components/memory/MemoryCapsuleView';

import { CreateMemory } from './components/CreateMemory'

function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-background">
        <header className="glass-effect sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Memory Capsule
            </h1>
            <WalletConnect />
          </div>
        </header>

        <main className="container mx-auto py-8">
          <CreateMemory />
        </main>

        <footer className="glass-effect mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <p className="text-center text-gray-600 font-medium">
              Memory Capsule Platform - Preserve your memories securely on the blockchain
            </p>
          </div>
        </footer>
      </div>
    </UserProvider>
  );
}export default App;
