// src/pages/Jugadores.js

import React, { useState, useEffect } from 'react';
import './Jugadores.css';
import defaultPlayerImage from '../assets/default-player.png';
import clubLogo from '../assets/club-logo.png';
import Navbar from '../components/Navbar';

function Jugadores() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Hacer la solicitud al backend para obtener los jugadores
    fetch(`${process.env.REACT_APP_API_URL}/chess_players`)
      .then(response => response.json())
      .then(data => setPlayers(data))
      .catch(error => console.error('Error al obtener los jugadores:', error));
  }, []);

  const filteredPlayers = players.filter(player =>
    `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <div className="jugadores-container">
        <h2>Jugadores</h2>
        <input
          type="text"
          placeholder="Buscar jugador"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="players-list">
          {filteredPlayers.map(player => (
            <div key={player.tablero} className="player-card">
              {/* Primera columna: Información del club */}
              <div className="club-info">
                <img src={clubLogo} alt="Club" className="club-logo" />
                <span className="division-tag">
                  {player.division === 'División de Honor' ? 'DH' : player.division}
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
          ))}
        </div>
      </div>
    </>
  );
}

export default Jugadores;
