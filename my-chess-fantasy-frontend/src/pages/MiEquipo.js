// src/components/MiEquipo.js

import React, { useState } from 'react';
import useFetchPlayersForMiEquipo from '../hooks/useFetchPlayersForMiEquipo';
import './MiEquipo.css';
import { Form } from 'react-bootstrap';
import defaultPlayerImage from '../assets/default-player.png';
import clubLogo from '../assets/club-logo.png';

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
  const [showPopup, setShowPopup] = useState({ visible: false, role: '', division: '', index: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [eloMin, setEloMin] = useState('');
  const [eloMax, setEloMax] = useState('');
  const [selectedTablero, setSelectedTablero] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Función para abrir el pop-up de selección
  const handleOpenPopup = (role, division, index) => {
    setShowPopup({ visible: true, role, division, index });
    setSearchTerm(''); // Reiniciar el término de búsqueda al abrir el pop-up
    setSelectedClub(''); // Reiniciar club al abrir pop-up
    setSelectedTablero(''); // Reiniciar tablero al abrir pop-up
    setEloMin('');
    setEloMax('');
  };

  // Función para cerrar el pop-up
  const handleClosePopup = () => {
    setShowPopup({ visible: false, role: '', division: '', index: null });
    setShowAdvancedSearch(false);
  };

  // Función para seleccionar un jugador en el pop-up
  const handleSelectPlayer = (player) => {
    const { role, index } = showPopup;
    setSelectedPlayers(prevState => ({
      ...prevState,
      [role]: prevState[role].map((p, i) => (i === index ? player : p)),
    }));
    handleClosePopup();
  };

  // Función para eliminar la selección de un jugador
  const handleRemovePlayer = (role, index) => {
    setSelectedPlayers(prevState => ({
      ...prevState,
      [role]: prevState[role].map((p, i) => (i === index ? null : p)),
    }));
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

  // Obtener opciones únicas de Club y Tablero
  const uniqueClubs = [...new Set(getPlayersForDivision(showPopup.division)
    .map(player => player.club)
    .filter(club => club != null))];

  const uniqueTableros = [...new Set(getPlayersForDivision(showPopup.division)
    .map(player => player.tablero)
    .filter(tablero => tablero != null))]
    .map(tablero => String(tablero))
    .sort((a, b) => a - b);

  // Filtrar los jugadores según todos los filtros seleccionados
  const filteredPlayers = getPlayersForDivision(showPopup.division).filter(player => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    const matchesSearchTerm = fullName.includes(searchTerm.toLowerCase());
    const matchesClub = selectedClub ? player.club === selectedClub : true;
    const matchesEloMin = eloMin ? player.elo_fide >= parseInt(eloMin, 10) : true;
    const matchesEloMax = eloMax ? player.elo_fide <= parseInt(eloMax, 10) : true;
    const matchesTablero = selectedTablero ? String(player.tablero) === selectedTablero : true;
    return matchesSearchTerm && matchesClub && matchesEloMin && matchesEloMax && matchesTablero;
  });

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
                >
                  <span className="mi-equipo-piece-icon">♔</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      {/* Información del club */}
                      <div className="club-info">
                        <img src={clubLogo} alt="Club" className="club-logo" />
                        <span className="division-tag">
                          {player.division === 'División de Honor' ? 'DH' :
                            player.division === 'Preferente' ? 'Pr' :
                            player.division === 'Primera División' ? '1a' :
                            player.division === 'Segunda División' ? '2a' :
                            player.division}
                        </span>
                      </div>

                      {/* Foto del jugador */}
                      <div className="player-photo">
                        <img
                          src={player.photo_url || defaultPlayerImage}
                          alt="Jugador"
                          className="player-image"
                        />
                        <span className="tablero-number">{player.tablero}</span>
                      </div>

                      {/* Detalles del jugador */}
                      <div className="player-details">
                        <p>{`${player.first_name} ${player.last_name}`}</p>
                        <p>Club: {player.club || '-'}</p>
                        <p>ELO FIDE: {player.elo_fide || '-'}</p>
                      </div>
                      <button className="mi-equipo-remove-button" onClick={() => handleRemovePlayer('reyes', index)}>Eliminar selección</button>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player" onClick={() => handleOpenPopup('reyes', 'División de Honor', index)}>Seleccionar Rey</p>
                  )}
                </div>
              ))}
              {selectedPlayers.damas.map((player, index) => (
                <div
                  key={`dama-${index}`}
                  className="mi-equipo-player-card mi-equipo-dama"
                >
                  <span className="mi-equipo-piece-icon">♕</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      {/* Información del club */}
                      <div className="club-info">
                        <img src={clubLogo} alt="Club" className="club-logo" />
                        <span className="division-tag">
                          {player.division === 'División de Honor' ? 'DH' :
                            player.division === 'Preferente' ? 'Pr' :
                            player.division === 'Primera División' ? '1a' :
                            player.division === 'Segunda División' ? '2a' :
                            player.division}
                        </span>
                      </div>

                      {/* Foto del jugador */}
                      <div className="player-photo">
                        <img
                          src={player.photo_url || defaultPlayerImage}
                          alt="Jugador"
                          className="player-image"
                        />
                        <span className="tablero-number">{player.tablero}</span>
                      </div>

                      {/* Detalles del jugador */}
                      <div className="player-details">
                        <p>{`${player.first_name} ${player.last_name}`}</p>
                        <p>Club: {player.club || '-'}</p>
                        <p>ELO FIDE: {player.elo_fide || '-'}</p>
                      </div>
                      <button className="mi-equipo-remove-button" onClick={() => handleRemovePlayer('damas', index)}>Eliminar selección</button>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player" onClick={() => handleOpenPopup('damas', 'División de Honor', index)}>Seleccionar Dama</p>
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
                >
                  <span className="mi-equipo-piece-icon">♖</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      {/* Información del club */}
                      <div className="club-info">
                        <img src={clubLogo} alt="Club" className="club-logo" />
                        <span className="division-tag">
                          {player.division === 'División de Honor' ? 'DH' :
                            player.division === 'Preferente' ? 'Pr' :
                            player.division === 'Primera División' ? '1a' :
                            player.division === 'Segunda División' ? '2a' :
                            player.division}
                        </span>
                      </div>

                      {/* Foto del jugador */}
                      <div className="player-photo">
                        <img
                          src={player.photo_url || defaultPlayerImage}
                          alt="Jugador"
                          className="player-image"
                        />
                        <span className="tablero-number">{player.tablero}</span>
                      </div>

                      {/* Detalles del jugador */}
                      <div className="player-details">
                        <p>{`${player.first_name} ${player.last_name}`}</p>
                        <p>Club: {player.club || '-'}</p>
                        <p>ELO FIDE: {player.elo_fide || '-'}</p>
                      </div>
                      <button className="mi-equipo-remove-button" onClick={() => handleRemovePlayer('torres', index)}>Eliminar selección</button>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player" onClick={() => handleOpenPopup('torres', 'Preferente', index)}>Seleccionar Torre</p>
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
                >
                  <span className="mi-equipo-piece-icon">♗</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      {/* Información del club */}
                      <div className="club-info">
                        <img src={clubLogo} alt="Club" className="club-logo" />
                        <span className="division-tag">
                          {player.division === 'División de Honor' ? 'DH' :
                            player.division === 'Preferente' ? 'Pr' :
                            player.division === 'Primera División' ? '1a' :
                            player.division === 'Segunda División' ? '2a' :
                            player.division}
                        </span>
                      </div>

                      {/* Foto del jugador */}
                      <div className="player-photo">
                        <img
                          src={player.photo_url || defaultPlayerImage}
                          alt="Jugador"
                          className="player-image"
                        />
                        <span className="tablero-number">{player.tablero}</span>
                      </div>

                      {/* Detalles del jugador */}
                      <div className="player-details">
                        <p>{`${player.first_name} ${player.last_name}`}</p>
                        <p>Club: {player.club || '-'}</p>
                        <p>ELO FIDE: {player.elo_fide || '-'}</p>
                      </div>
                      <button className="mi-equipo-remove-button" onClick={() => handleRemovePlayer('alfiles', index)}>Eliminar selección</button>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player" onClick={() => handleOpenPopup('alfiles', 'Primera División', index)}>Seleccionar Alfil</p>
                  )}
                </div>
              ))}
              {selectedPlayers.caballos.map((player, index) => (
                <div
                  key={`caballo-${index}`}
                  className="mi-equipo-player-card mi-equipo-caballo"
                >
                  <span className="mi-equipo-piece-icon">♘</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      {/* Información del club */}
                      <div className="club-info">
                        <img src={clubLogo} alt="Club" className="club-logo" />
                        <span className="division-tag">
                          {player.division === 'División de Honor' ? 'DH' :
                            player.division === 'Preferente' ? 'Pr' :
                            player.division === 'Primera División' ? '1a' :
                            player.division === 'Segunda División' ? '2a' :
                            player.division}
                        </span>
                      </div>

                      {/* Foto del jugador */}
                      <div className="player-photo">
                        <img
                          src={player.photo_url || defaultPlayerImage}
                          alt="Jugador"
                          className="player-image"
                        />
                        <span className="tablero-number">{player.tablero}</span>
                      </div>

                      {/* Detalles del jugador */}
                      <div className="player-details">
                        <p>{`${player.first_name} ${player.last_name}`}</p>
                        <p>Club: {player.club || '-'}</p>
                        <p>ELO FIDE: {player.elo_fide || '-'}</p>
                      </div>
                      <button className="mi-equipo-remove-button" onClick={() => handleRemovePlayer('caballos', index)}>Eliminar selección</button>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player" onClick={() => handleOpenPopup('caballos', 'Primera División', index)}>Seleccionar Caballo</p>
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
                >
                  <span className="mi-equipo-piece-icon">♙</span>
                  {player ? (
                    <div className="mi-equipo-player-info">
                      {/* Información del club */}
                      <div className="club-info">
                        <img src={clubLogo} alt="Club" className="club-logo" />
                        <span className="division-tag">
                          {player.division === 'División de Honor' ? 'DH' :
                            player.division === 'Preferente' ? 'Pr' :
                            player.division === 'Primera División' ? '1a' :
                            player.division === 'Segunda División' ? '2a' :
                            player.division}
                        </span>
                      </div>

                      {/* Foto del jugador */}
                      <div className="player-photo">
                        <img
                          src={player.photo_url || defaultPlayerImage}
                          alt="Jugador"
                          className="player-image"
                        />
                        <span className="tablero-number">{player.tablero}</span>
                      </div>

                      {/* Detalles del jugador */}
                      <div className="player-details">
                        <p>{`${player.first_name} ${player.last_name}`}</p>
                        <p>Club: {player.club || '-'}</p>
                        <p>ELO FIDE: {player.elo_fide || '-'}</p>
                      </div>
                      <button className="mi-equipo-remove-button" onClick={() => handleRemovePlayer('peones', index)}>Eliminar selección</button>
                    </div>
                  ) : (
                    <p className="mi-equipo-select-player" onClick={() => handleOpenPopup('peones', 'Segunda División', index)}>Seleccionar Peón</p>
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
            <button className="mi-equipo-close-popup" onClick={handleClosePopup} aria-label="Cerrar pop-up">
              &times;
            </button>
            <h3>Seleccionar {showPopup.role}</h3>
            <input
              type="text"
              className="mi-equipo-search-input"
              placeholder="Buscar jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="mi-equipo-advanced-search-button">
              Búsqueda avanzada
            </button>
            {showAdvancedSearch && (
              <div className="mi-equipo-advanced-search-container">
                <Form className="filters-form">
                  <Form.Group controlId="formClubFilter" className="filter-group">
                    <Form.Label>Club</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedClub}
                      onChange={(e) => setSelectedClub(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {uniqueClubs.map((club, index) => (
                        <option key={index} value={club}>{club}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="formEloMinFilter" className="filter-group">
                    <Form.Label>ELO mínimo</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="ELO mínimo"
                      value={eloMin}
                      onChange={(e) => setEloMin(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="formEloMaxFilter" className="filter-group">
                    <Form.Label>ELO máximo</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="ELO máximo"
                      value={eloMax}
                      onChange={(e) => setEloMax(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="formTableroFilter" className="filter-group">
                    <Form.Label>Tablero</Form.Label>
                    <Form.Control
                      as="select"
                      value={selectedTablero}
                      onChange={(e) => setSelectedTablero(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {uniqueTableros.map((tablero, index) => (
                        <option key={index} value={tablero}>{tablero}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Form>
              </div>
            )}
            <ul className="mi-equipo-ul">
              {filteredPlayers.map(player => (
                <li key={player.id} className="mi-equipo-li">
                  <button
                    onClick={() => handleSelectPlayer(player)}
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
