// src/pages/MiEquipo.js

import React, { useState, useEffect } from 'react';
import useFetchPlayersForMiEquipo from '../hooks/useFetchPlayersForMiEquipo';
import './MiEquipo.css'; // Asegúrate de crear este archivo para los estilos

const divisionCategories = {
  'División de Honor': ['Rey Blanco', 'Rey Negro', 'Dama Blanca', 'Dama Negra'],
  'Primera División': ['Alfil Blanco', 'Alfil Negro', 'Caballo Blanco', 'Caballo Negro'],
  'Segunda División': ['Peón Negro 1', 'Peón Blanco 1', 'Peón Blanco 2', 'Peón Negro 2'],
};

function MiEquipo() {
  const { players, isLoading, error } = useFetchPlayersForMiEquipo();

  const [selectedPlayers, setSelectedPlayers] = useState({
    'Rey Blanco': null,
    'Rey Negro': null,
    'Dama Blanca': null,
    'Dama Negra': null,
    'Alfil Blanco': null,
    'Alfil Negro': null,
    'Caballo Blanco': null,
    'Caballo Negro': null,
    'Peón Negro 1': null,
    'Peón Blanco 1': null,
    'Peón Blanco 2': null,
    'Peón Negro 2': null,
  });

  // Filtrar jugadores por división
  const filteredPlayers = {
    'División de Honor': players.filter(player => player.division === 'División de Honor'),
    'Primera División': players.filter(player => player.division === 'Primera División'),
    'Segunda División': players.filter(player => player.division === 'Segunda División'),
  };

  // Obtener una lista de jugadores ya seleccionados para evitar duplicados
  const selectedPlayerIds = Object.values(selectedPlayers)
    .filter(player => player !== null)
    .map(player => player.id);

  // Función para manejar la selección de un jugador en una categoría específica
  const handleSelectChange = (category, playerId) => {
    const player = players.find(p => p.id === playerId);
    setSelectedPlayers(prevState => ({
      ...prevState,
      [category]: player || null,
    }));
  };

  // Función para eliminar un jugador de una categoría
  const handleRemovePlayer = (category) => {
    setSelectedPlayers(prevState => ({
      ...prevState,
      [category]: null,
    }));
  };

  // Función para verificar si un jugador ya está seleccionado en otra categoría
  const isPlayerSelected = (playerId) => {
    return selectedPlayerIds.includes(playerId);
  };

  return (
    <div className="mi-equipo-container">
      <h1>Mi Equipo</h1>

      {/* Dropdowns para cada categoría */}
      <div className="categories-container">
        {Object.entries(divisionCategories).map(([division, categories]) => (
          <div key={division} className="division-section">
            <h2>{division}</h2>
            {categories.map(category => (
              <div key={category} className="category">
                <label>{category}:</label>
                <select
                  value={selectedPlayers[category]?.id || ''}
                  onChange={(e) => handleSelectChange(category, e.target.value)}
                >
                  <option value="" disabled>Selecciona un jugador</option>
                  {filteredPlayers[division].map(player => (
                    <option
                      key={player.id}
                      value={player.id}
                      disabled={isPlayerSelected(player.id) && selectedPlayers[category]?.id !== player.id}
                    >
                      {player.username} - {player.teamName}
                    </option>
                  ))}
                </select>
                {selectedPlayers[category] && (
                  <button onClick={() => handleRemovePlayer(category)} className="remove-button">
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Opcional: Mostrar el equipo completo seleccionado */}
      <div className="selected-team">
        <h2>Equipo Seleccionado</h2>
        <ul>
          {Object.entries(selectedPlayers).map(([category, player]) => (
            <li key={category}>
              <strong>{category}:</strong> {player ? `${player.username} - ${player.teamName}` : 'No seleccionado'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MiEquipo;
