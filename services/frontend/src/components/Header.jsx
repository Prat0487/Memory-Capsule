import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Memory Capsule
          </Link>
                      <div className="flex items-center space-x-4">
                        <Link to="/" className="font-medium">Home</Link>
                        <Link to="/memories" className="font-medium">My Memories</Link>
                        <Link to="/create" className="font-medium">Create</Link>
            
                        {localStorage.getItem('userAddress') ? (
                          // User is logged in - show address
                          <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                            {localStorage.getItem('userAddress').substring(0, 6)}...
                            {localStorage.getItem('userAddress').substring(localStorage.getItem('userAddress').length - 4)}
                          </div>
                        ) : (
                          // User is not logged in - show auth buttons
                          <div className="flex space-x-2">
                            <Link to="/login" className="px-4 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
                              Log In
                            </Link>
                            <Link to="/signup" className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                              Sign Up
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>      </div>
    </header>
  )
}

export default Header