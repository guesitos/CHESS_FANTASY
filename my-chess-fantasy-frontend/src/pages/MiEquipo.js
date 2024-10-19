import React, { useState } from 'react';
import useFetchPlayersForMiEquipo from '../hooks/useFetchPlayersForMiEquipo';
import './MiEquipo.css';

function MiEquipo() {
  // Obtener jugadores para cada división
  const { players: playersDivisionHonor, isLoading: loadingHonor } = useFetchPlayersForMiEquipo('División de Honor');
  const { players: playersPrimeraDivision, isLoading: loadingPrimera } = useFetchPlayersForMiEquipo('Primera División');
  const { players: playersPreferente, isLoading: loadingPreferente } = useFetchPlayersForMiEquipo('Preferente');
  const { players: playersSegundaDivision, isLoading: loadingSegunda } = useFetchPlayersForMiEquipo('Segunda División');

  const [selectedPlayers, setSelectedPlayers] = useState({
    peones: Array(4).fill(null),
    alfiles: Array(2).fill(null),
    caballos: Array(2).fill(null),
    torres: Array(4).fill(null),
    reyes: Array(2).fill(null),
    damas: Array(2).fill(null),
  });

  // Estado para el pop-up
  const [showPopup, setShowPopup] = useState({ visible: false, role: '', division: '' });

  // Función para abrir el pop-up de selección
  const handleOpenPopup = (role, division) => {
    setShowPopup({ visible: true, role, division });
  };

  // Función para cerrar el pop-up
  const handleClosePopup = () => {
    setShowPopup({ visible: false, role: '', division: '' });
  };

  // Función para seleccionar un jugador en el pop-up
  const handleSelectPlayer = (index, player) => {
    setSelectedPlayers(prevState => ({
      ...prevState,
      [showPopup.role]: prevState[showPopup.role].map((p, i) => (i === index ? player : p)),
    }));
    handleClosePopup();
  };

  const getPlayersForDivision = (division) => {
    switch (division) {
      case 'División de Honor':
        return playersDivisionHonor;
      case 'Primera División':
        return playersPrimeraDivision;
      case 'Preferente':
        return playersPreferente;
      case 'Segunda División':
        return playersSegundaDivision;
      default:
        return [];
    }
  };

  return (
    <div className="mi-equipo-container">
      <h1 className="mi-equipo-title">Alineación de la Jornada</h1>

      {loadingHonor || loadingPrimera || loadingPreferente || loadingSegunda ? (
        <p>Cargando jugadores...</p>
      ) : (
        <>
          {/* División de Honor - Reyes y Damas */}
          <div className="mi-equipo-division-section">
            <h2 className="mi-equipo-division-title">División de Honor</h2>
            <div className="mi-equipo-role-cards">
              {selectedPlayers.reyes.map((player, index) => (
                <div
                  key={`rey-${index}`}
                  className="mi-equipo-player-card mi-equipo-rey"
                  onClick={() => handleOpenPopup('reyes', 'División de Honor')}
                >
                  <span className="mi-equipo-piece-icon">♔</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      <p>{`${player.first_name} ${player.last_name}`}</p>
                      <p>{player.club}</p>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player">Seleccionar Rey</p>
                  )}
                </div>
              ))}
              {selectedPlayers.damas.map((player, index) => (
                <div
                  key={`dama-${index}`}
                  className="mi-equipo-player-card mi-equipo-dama"
                  onClick={() => handleOpenPopup('damas', 'División de Honor')}
                >
                  <span className="mi-equipo-piece-icon">♕</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      <p>{`${player.first_name} ${player.last_name}`}</p>
                      <p>{player.club}</p>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player">Seleccionar Dama</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preferente - Torres */}
          <div className="mi-equipo-division-section">
            <h2 className="mi-equipo-division-title">Preferente</h2>
            <div className="mi-equipo-role-cards">
              {selectedPlayers.torres.map((player, index) => (
                <div
                  key={`torre-${index}`}
                  className="mi-equipo-player-card mi-equipo-torre"
                  onClick={() => handleOpenPopup('torres', 'Preferente')}
                >
                  <span className="mi-equipo-piece-icon">♖</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      <p>{`${player.first_name} ${player.last_name}`}</p>
                      <p>{player.club}</p>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player">Seleccionar Torre</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Primera División - Alfiles y Caballos */}
          <div className="mi-equipo-division-section">
            <h2 className="mi-equipo-division-title">Primera División</h2>
            <div className="mi-equipo-role-cards">
              {selectedPlayers.alfiles.map((player, index) => (
                <div
                  key={`alfil-${index}`}
                  className="mi-equipo-player-card mi-equipo-alfil"
                  onClick={() => handleOpenPopup('alfiles', 'Primera División')}
                >
                  <span className="mi-equipo-piece-icon">♗</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      <p>{`${player.first_name} ${player.last_name}`}</p>
                      <p>{player.club}</p>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player">Seleccionar Alfil</p>
                  )}
                </div>
              ))}
              {selectedPlayers.caballos.map((player, index) => (
                <div
                  key={`caballo-${index}`}
                  className="mi-equipo-player-card mi-equipo-caballo"
                  onClick={() => handleOpenPopup('caballos', 'Primera División')}
                >
                  <span className="mi-equipo-piece-icon">♘</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      <p>{`${player.first_name} ${player.last_name}`}</p>
                      <p>{player.club}</p>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player">Seleccionar Caballo</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Segunda División - Peones */}
          <div className="mi-equipo-division-section">
            <h2 className="mi-equipo-division-title">Segunda División</h2>
            <div className="mi-equipo-role-cards">
              {selectedPlayers.peones.map((player, index) => (
                <div
                  key={`peon-${index}`}
                  className="mi-equipo-player-card mi-equipo-peon"
                  onClick={() => handleOpenPopup('peones', 'Segunda División')}
                >
                  <span className="mi-equipo-piece-icon">♙</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      <p>{`${player.first_name} ${player.last_name}`}</p>
                      <p>{player.club}</p>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player">Seleccionar Peón</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Pop-up para seleccionar jugadores */}
      {showPopup.visible && (
        <div className="mi-equipo-popup-container">
          <div className="mi-equipo-popup-content">
            <h3>Seleccionar {showPopup.role}</h3>
            <button className="mi-equipo-close-popup" onClick={handleClosePopup}>
              X
            </button>
            <ul className="mi-equipo-ul">
              {getPlayersForDivision(showPopup.division).map(player => (
                <li key={player.id} className="mi-equipo-li">
                  <button
                    onClick={() => handleSelectPlayer(showPopup.role, player)}
                    disabled={Object.values(selectedPlayers).flat().includes(player)}
                  >
                    {player.first_name} {player.last_name} - {player.club}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default MiEquipo;
