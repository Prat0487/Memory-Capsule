import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

function Navigation() {
  const { account, connectWallet } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  // Handle mobile menu
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'bg-gradient-to-r from-blue-900 to-purple-900 py-4'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold flex items-center">
            <img src="/assets/logo.svg" alt="Memory Capsule" className="h-8 mr-2" />
            <span className={scrolled ? 'text-blue-900' : 'text-white'}>Memory Capsule</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`${scrolled ? 'text-gray-700' : 'text-white'} ${
                location.pathname === '/' ? 'font-semibold' : 'font-medium'
              } hover:text-blue-300 transition`}
            >
              Home
            </Link>
            <Link 
              to="/memories" 
              className={`${scrolled ? 'text-gray-700' : 'text-white'} ${
                location.pathname === '/memories' ? 'font-semibold' : 'font-medium'
              } hover:text-blue-300 transition`}
            >
              My Memories
            </Link>
            <Link 
              to="/create" 
              className={`${scrolled ? 'text-gray-700' : 'text-white'} ${
                location.pathname === '/create' ? 'font-semibold' : 'font-medium'
              } hover:text-blue-300 transition`}
            >
              Create
            </Link>
            
            {account ? (
              <div className={`flex items-center ${
                scrolled ? 'bg-gray-100' : 'bg-gray-800 bg-opacity-50'
              } px-4 py-2 rounded-full`}>
                <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                <span className={scrolled ? 'text-gray-800' : 'text-white'}>
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </span>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className={`${
                  scrolled 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-900'
                } px-4 py-2 rounded-full hover:bg-opacity-90 transition flex items-center`}
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Connect Wallet
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu} 
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <svg 
              className={`h-6 w-6 ${scrolled ? 'text-gray-800' : 'text-white'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-200 pt-4">
            <Link 
              to="/" 
              className={`block py-2 px-4 rounded ${
                location.pathname === '/' 
                  ? (scrolled ? 'bg-blue-100 text-blue-900' : 'bg-white/10 text-white') 
                  : (scrolled ? 'text-gray-800' : 'text-white')
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/memories" 
              className={`block py-2 px-4 rounded ${
                location.pathname === '/memories' 
                  ? (scrolled ? 'bg-blue-100 text-blue-900' : 'bg-white/10 text-white') 
                  : (scrolled ? 'text-gray-800' : 'text-white')
              }`}
              onClick={() => setMenuOpen(false)}
            >
              My Memories
            </Link>
            <Link 
              to="/create" 
              className={`block py-2 px-4 rounded ${
                location.pathname === '/create' 
                  ? (scrolled ? 'bg-blue-100 text-blue-900' : 'bg-white/10 text-white') 
                  : (scrolled ? 'text-gray-800' : 'text-white')
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Create
            </Link>
            
            {!account && (
              <button 
                onClick={() => {
                  connectWallet();
                  setMenuOpen(false);
                }}
                className={`w-full text-left py-2 px-4 rounded ${
                  scrolled ? 'bg-blue-600 text-white' : 'bg-white text-blue-900'
                }`}
              >
                Connect Wallet
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;