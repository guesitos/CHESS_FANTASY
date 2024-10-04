// src/pages/Transfers.js
import React from 'react';
import PlayerList from '../components/PlayerList';

function Transfers() {
  const players = [
    { id: 1, name: 'Magnus Carlsen', elo: 2847, team: 'Equipo A' },
    { id: 2, name: 'Fabiano Caruana', elo: 2820, team: 'Equipo B' },
    // Añade más jugadores
  ];

  return (
    <div>
      <h2>Fichajes</h2>
      <PlayerList players={players} />
    </div>
  );
}

export default Transfers;

