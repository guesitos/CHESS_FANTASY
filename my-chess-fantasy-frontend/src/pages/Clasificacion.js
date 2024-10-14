// src/pages/Standings.js
import React, { useState, useEffect } from 'react';

function Standings() {
  const [standings, setStandings] = useState([
    { name: 'Jugador 1', points: 100 },
    { name: 'Jugador 2', points: 95 },
    // Más jugadores...
  ]);  

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/standings`)
      .then(response => response.json())
      .then(data => setStandings(data))
      .catch(error => console.error('Error fetching standings:', error));
  }, []);

  return (
    <div>
      <h2>Clasificaciones</h2>
      <ul>
        {standings.map((player, index) => (
          <li key={index}>
            {player.name} - {player.points} puntos
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Standings;
