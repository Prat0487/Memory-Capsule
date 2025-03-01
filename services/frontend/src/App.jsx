import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { MemoriesPage } from './pages/MemoriesPage'
import CreateMemoryPage from './pages/CreateMemoryPage'
import MemoryDetailPage from './pages/MemoryDetailPage'
import Navigation from './components/Navigation'
import Footer from './components/Footer'

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow pt-16 md:pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/memories" element={<MemoriesPage />} />
            <Route path="/create" element={<CreateMemoryPage />} />
            <Route path="/memory/:id" element={<MemoryDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App