// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Navbar from './components/Navbar';
import Home from './pages/Home';
import Registro from './pages/Registro';
import Standings from './pages/Standings';
import Transfers from './pages/Transfers';
import Jugadores from './pages/Jugadores';

function App() {
  return (
    <Router>
      {/* Navbar puede estar fuera o dentro de las rutas dependiendo de si quieres mostrarlo en la página de registro */}
      <Routes>
        <Route path="/" element={<Registro />} /> {/* Página de registro */}
        <Route path="/home" element={<Home />} /> {/* Página Home después de iniciar sesión */}
        <Route path="/standings" element={<Standings />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/jugadores" element={<Jugadores />} /> {/* Nueva página de jugadores */}
        {/* Añade más rutas aquí */}
      </Routes>
    </Router>
  );
}

export default App;