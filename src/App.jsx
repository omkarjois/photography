import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import AlbumStory from './pages/AlbumStory';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Admin/Dashboard';

export default function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-black font-sans text-gray-100 selection:bg-white selection:text-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:albumId" element={<AlbumStory />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<Dashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}
