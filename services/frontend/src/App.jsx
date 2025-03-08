import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/SimpleAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MemoriesPage from './pages/MemoriesPage'
import MemoryDetailPage from './pages/MemoryDetailPage'
import CreateMemoryPage from './pages/CreateMemoryPage'
import SharedMemoryPage from './pages/SharedMemoryPage'
import AuthCallback from './pages/AuthCallback' // Add this import
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-100">
          <Header />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth-callback" element={<AuthCallback />} /> {/* Add this line */}
            {/* Other routes */}
          </Routes>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App