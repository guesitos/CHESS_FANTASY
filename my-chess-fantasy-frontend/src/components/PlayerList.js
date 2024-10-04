// src/components/PlayerList.js
import React from 'react';

function PlayerList({ players }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>ELO</th>
          <th>Equipo</th>
        </tr>
      </thead>
      <tbody>
        {players.map(player => (
          <tr key={player.id}>
            <td>{player.name}</td>
            <td>{player.elo}</td>
            <td>{player.team}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PlayerList;

