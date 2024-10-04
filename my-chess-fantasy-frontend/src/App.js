// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Standings from './pages/Standings';
import Transfers from './pages/Transfers';
// Importa otras páginas según las vayas creando

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/transfers" element={<Transfers />} />
        {/* Añade más rutas aquí */}
      </Routes>
    </Router>
  );
}

export default App;


