import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { MemoriesPage } from './pages/MemoriesPage'
import CreateMemoryPage from './pages/CreateMemoryPage'
import MemoryDetailPage from './pages/MemoryDetailPage'
import SharedMemoryView from './pages/SharedMemoryView'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow pt-16 md:pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/create" element={<CreateMemoryPage />} />
            <Route path="/memory/:id" element={<MemoryDetailPage />} />
            <Route path="/shared/:id" element={<SharedMemoryView />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </Router>
  )
}
export default App