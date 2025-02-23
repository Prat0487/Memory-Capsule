// src/App.jsx
import React from 'react';
import { UserProvider } from './context/UserContext';
import WalletConnect from './components/auth/WalletConnect';
import MemoryCapsuleCreate from './components/memory/MemoryCapsuleCreate';
import MemoryCapsuleView from './components/memory/MemoryCapsuleView';

function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Memory Capsule</h1>
            <WalletConnect />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <MemoryCapsuleCreate />
            <MemoryCapsuleView />
          </div>
        </main>

        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              Memory Capsule Platform - Preserve your memories securely on the blockchain
            </p>
          </div>
        </footer>
      </div>
    </UserProvider>
  );
}

export default App;
