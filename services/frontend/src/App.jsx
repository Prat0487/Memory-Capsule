import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MemoriesPage from './pages/MemoriesPage'
import MemoryDetailPage from './pages/MemoryDetailPage'
import CreateMemoryPage from './pages/CreateMemoryPage'
import SharedMemoryPage from './pages/SharedMemoryPage'
import AuthCallback from './pages/AuthCallback'
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
            <Route path="/auth-callback" element={<AuthCallback />} />
            
            {/* Add protected routes */}
            <Route path="/" element={<ProtectedRoute><MemoriesPage /></ProtectedRoute>} />
            <Route path="/memories/:id" element={<ProtectedRoute><MemoryDetailPage /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreateMemoryPage /></ProtectedRoute>} />
            <Route path="/shared/:id" element={<SharedMemoryPage />} />
          </Routes>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App