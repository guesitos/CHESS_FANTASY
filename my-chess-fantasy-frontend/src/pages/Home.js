// src/pages/Home.js
import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <h2>Guía Rápida</h2>
      <p>Aprende a crear y gestionar tu equipo en el Fantasy de ajedrez. ¡Es fácil y divertido!</p>

      <h2>Noticias Destacadas</h2>
      <p>Entérate de los próximos torneos, actualizaciones de la plataforma y más.</p>

      <h2>Resumen de Funcionalidades</h2>
      <div className="features-links">
        <a href="/equipo">Mi Equipo</a>
        <a href="/clasificacion">Clasificación</a>
        <a href="/mercado">Mercado</a>
        <a href="/estadisticas">Estadísticas</a>
      </div>
    </div>
  );
}

export default Home;
