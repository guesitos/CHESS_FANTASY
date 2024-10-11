// src/pages/Jugadores.js

import React, { useState, useEffect } from 'react';
import './Jugadores.css';
import defaultPlayerImage from '../assets/default-player.png';
import clubLogo from '../assets/club-logo.png';
import Navbar from '../components/Navbar';

function Jugadores() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para obtener jugadores desde la base de datos
  const fetchPlayers = (query = '') => {
    let url = `${process.env.REACT_APP_API_URL}/chess_players`;

    // Si hay un término de búsqueda, agregamos /search y el término de búsqueda como parámetro
    if (query) {
      url += `/search?search=${encodeURIComponent(query)}`;
    }

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al buscar jugadores');
        }
        return response.json();
      })
      .then(data => {
        setPlayers(data);
      })
      .catch(error => console.error('Error al obtener los jugadores:', error));
  };

  useEffect(() => {
    // Obtener todos los jugadores al cargar el componente
    fetchPlayers();
  }, []);

  const handleSearchClick = () => {
    // Al hacer clic en la lupa, hacemos la solicitud al backend con el término de búsqueda
    fetchPlayers(searchTerm);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <>
      <Navbar />

      <div className="jugadores-container">
        <h2>Jugadores</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar jugador"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearchClick} className="search-button">
            <span role="img" aria-label="Buscar">🔍</span>
          </button>
        </div>
        <div className="players-list">
          {players.length > 0 ? (
            players.map(player => (
              <div key={player.tablero} className="player-card">
                {/* Primera columna: Información del club */}
                <div className="club-info">
                  <img src={clubLogo} alt="Club" className="club-logo" />
                  <span className="division-tag">
                    {player.division === 'División de Honor' ? 'DH' : player.division === 'Primera División' ? '1a' : player.division === 'Segunda División' ? '2a' : player.division}
                  </span>
                </div>

                {/* Segunda columna: Foto del jugador */}
                <div className="player-photo">
                  <img
                    src={player.photo_url || defaultPlayerImage}
                    alt="Jugador"
                    className="player-image"
                  />
                  <span className="tablero-number">{player.tablero}</span>
                </div>

                {/* Tercera columna: Detalles del jugador */}
                <div className="player-details">
                  <h3>{`${player.last_name}, ${player.first_name}`}</h3>
                  <p>Valor: {player.valor || '-'}</p>
                  <p>ELO FIDE: {player.elo_fide || '-'}</p>
                </div>

                {/* Cuarta columna: Información de partidas */}
                <div className="match-info">
                  <div className="match-points">
                    {[...Array(11)].map((_, index) => (
                      <div key={index} className="match-rectangle">-</div>
                    ))}
                  </div>
                  <div className="total-points">
                    Puntos totales: {player.total_points || '-'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No se encontraron jugadores</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Jugadores;