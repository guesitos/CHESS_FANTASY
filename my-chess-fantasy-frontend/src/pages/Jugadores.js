// src/pages/Jugadores.js

import React, { useContext } from 'react';
import './Jugadores.css';
import defaultPlayerImage from '../assets/default-player.png';
import clubLogo from '../assets/club-logo.png';
import { Form } from 'react-bootstrap';
import { PlayersContext } from '../context/PlayersContext';

function Jugadores() {
  const {
    players,
    searchTerm,
    setSearchTerm,
    selectedClub,
    setSelectedClub,
    eloMin,
    setEloMin,
    eloMax,
    setEloMax,
    selectedDivision,
    setSelectedDivision,
    selectedTablero,
    setSelectedTablero,
    isLoading,
    showAdvancedSearch,
    toggleAdvancedSearch,
    currentPage,
    //setCurrentPage,
    totalPages,
    clubs,
    tableros,
    sortOption,
    handleSortChange,
    handleSearchClick,
    handleResetClick,
    handleKeyDown,
    handlePreviousPage,
    handleNextPage,
    error
  } = useContext(PlayersContext);

  return (
    <div className="jugadores-container">
      <h2>Jugadores de la Fantasy</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar jugador"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearchClick} className="search-button">
          <span role="img" aria-label="Buscar">🔍</span>
        </button>
        <button onClick={handleResetClick} className="reset-button">
          Restablecer
        </button>
        <button onClick={toggleAdvancedSearch} className="advanced-search-button">
          Búsqueda avanzada
        </button>
      </div>
      <div className="sort-container">
        <label htmlFor="sort">Ordenar por:</label>
        <select id="sort" value={sortOption} onChange={handleSortChange} className="sort-select">
          <option value="">Seleccione una opción</option>
          <option value="elo">ELO FIDE</option>
          <option value="club">Club</option>
          <option value="apellido">Apellido</option>
          <option value="puntos_jornada">Puntos Jornada 1</option>
          <option value="puntos_totales">Puntos Totales</option>
        </select>
      </div>
      {showAdvancedSearch && (
        <div className="advanced-search-container">
          <Form className="filters-form">
            <Form.Group controlId="formClubFilter" className="filter-group">
              <Form.Label>Club</Form.Label>
              <Form.Control
                as="select"
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
              >
                <option value="">Todos</option>
                {clubs.map((club, index) => (
                  <option key={index} value={club.club}>{club.club}</option>
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
            <Form.Group controlId="formDivisionFilter" className="filter-group">
              <Form.Label>División</Form.Label>
              <Form.Control
                as="select"
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="División de Honor">División de Honor</option>
                <option value="Preferente">Preferente</option>
                <option value="Primera División">Primera División</option>
                <option value="Segunda División">Segunda División</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formTableroFilter" className="filter-group">
              <Form.Label>Tablero</Form.Label>
              <Form.Control
                as="select"
                value={selectedTablero}
                onChange={(e) => setSelectedTablero(e.target.value)}
              >
                <option value="">Todos</option>
                {tableros.map((tablero, index) => (
                  <option key={index} value={tablero.tablero}>{tablero.tablero}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
      )}
      {error && <p className="error-message">{error}</p>} {/* Mostrar mensaje de error */}
      {isLoading ? (
        <p>Cargando jugadores...</p>
      ) : (
        <div className="players-list">
          {players && players.length > 0 ? (
            players.map(player => (
              <div key={`${player.tablero}-${player.fide_id}`} className="player-card">
                {/* Primera columna: Información del club */}
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
                  <p>{player.club || '-'}</p> {/* Nuevo campo para el Club */}
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
      )}
      <div className="pagination-container">
        <button onClick={handlePreviousPage} className="pagination-button" disabled={currentPage === 1}>
          &laquo; Anterior
        </button>
        <span className="pagination-info">Página {currentPage} de {totalPages}</span>
        <button onClick={handleNextPage} className="pagination-button" disabled={currentPage === totalPages}>
          Siguiente &raquo;
        </button>
      </div>
    </div>
  );
}

export default Jugadores;
