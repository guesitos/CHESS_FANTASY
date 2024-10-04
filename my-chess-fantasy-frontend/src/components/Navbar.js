// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <h2>My Chess Fantasy</h2>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/standings">Clasificaciones</Link></li>
        <li><Link to="/transfers">Fichajes</Link></li>
        {/* Añade más enlaces según tus páginas */}
      </ul>
    </nav>
  );
}

export default Navbar;
