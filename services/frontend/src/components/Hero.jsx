import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div className="relative bg-gradient-to-b from-blue-900 to-indigo-900 text-white">
      <div className="absolute inset-0 opacity-20 bg-pattern"></div>
      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Preserve Your Memories Forever
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Memory Capsule secures your precious moments on the blockchain, 
              enhanced by AI and accessible for generations to come.
            </p>
            <div className="flex space-x-4">
              <Link 
                to="/create" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition shadow-lg"
              >
                Create Memory
              </Link>
              <Link 
                to="/memories" 
                className="bg-transparent border border-white hover:bg-white hover:text-blue-900 text-white px-8 py-3 rounded-lg transition"
              >
                View Memories
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/assets/hero-image.png" 
              alt="Memories visualization" 
              className="rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
