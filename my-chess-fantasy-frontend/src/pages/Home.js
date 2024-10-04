// src/pages/Home.js
import React, { useState } from 'react';
import Navbar from '../components/Navbar'; // Incluimos el Navbar

function Home() {
  const [message] = useState('GALICHESS FANTASY');

  return (
    <div>
      <Navbar /> {/* Aquí tu barra de navegación */}
      <h2>{message}</h2>
      {/* Otros componentes, como Standings, Transfers, etc. */}
    </div>
  );
}

export default Home;

