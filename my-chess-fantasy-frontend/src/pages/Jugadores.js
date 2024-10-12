// src/pages/Jugadores.js

import React, { useState, useEffect } from 'react';
import './Jugadores.css';
import defaultPlayerImage from '../assets/default-player.png';
import clubLogo from '../assets/club-logo.png';
import Navbar from '../components/Navbar';
import { Form } from 'react-bootstrap';

function Jugadores() {
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [eloMin, setEloMin] = useState('');
  const [eloMax, setEloMax] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedTablero, setSelectedTablero] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [clubs, setClubs] = useState([]);
  const [tableros, setTableros] = useState([]);
  const [sortOption, setSortOption] = useState('');

  const playersPerPage = 20;

  // Función para obtener jugadores desde la base de datos
  const fetchPlayers = (
    searchTerm = '',
    club = '',
    eloMin = '',
    eloMax = '',
    division = '',
    tablero = '',
    page = 1,
    sort = ''
  ) => {
    setIsLoading(true);
    let url = `${process.env.REACT_APP_API_URL}/chess_players/search`;

    // Construir la URL con los filtros
    const params = new URLSearchParams();
    if (searchTerm && searchTerm.trim() !== '') params.append('searchTerm', searchTerm); // Cambio aquí
    if (club && club.trim() !== '') params.append('club', club);
    if (eloMin && eloMin.trim() !== '') params.append('eloMin', eloMin);
    if (eloMax && eloMax.trim() !== '') params.append('eloMax', eloMax);
    if (division && division.trim() !== '') params.append('division', division);
    if (tablero && tablero.trim() !== '') params.append('tablero', tablero);
    params.append('page', page);
    params.append('limit', playersPerPage);
    if (sort && sort.trim() !== '') params.append('sort', sort);

    // Agregar los parámetros si existen
    url += `?${params.toString()}`;

    console.log(`Fetching players from URL: ${url}`); // Log para verificar la URL

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al buscar jugadores');
        }
        return response.json();
      })
      .then(data => {
        console.log('Jugadores encontrados:', data.players); // Log para verificar los datos recibidos
        setPlayers(data.players);
        setTotalPages(data.totalPages);
      })
      .catch(error => console.error('Error al obtener los jugadores:', error))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // Obtener todos los jugadores al cargar el componente
    fetchPlayers(searchTerm, selectedClub, eloMin, eloMax, selectedDivision, selectedTablero, currentPage, sortOption);
  }, [searchTerm, selectedClub, eloMin, eloMax, selectedDivision, selectedTablero, currentPage, sortOption]);

  useEffect(() => {
    // Obtener los clubes y tableros al cargar el componente
    fetch(`${process.env.REACT_APP_API_URL}/chess_players/clubs`)
      .then(response => response.json())
      .then(data => setClubs(data))
      .catch(error => console.error('Error al obtener los clubes:', error));

    fetch(`${process.env.REACT_APP_API_URL}/chess_players/tableros`)
      .then(response => response.json())
      .then(data => setTableros(data))
      .catch(error => console.error('Error al obtener los tableros:', error));
  }, []);

  const handleSearchClick = () => {
    setPlayers([]); // Limpiar los resultados anteriores antes de iniciar la nueva búsqueda
    console.log(`Iniciando búsqueda con el término: ${searchTerm}`);
    fetchPlayers(searchTerm, selectedClub, eloMin, eloMax, selectedDivision, selectedTablero, 1, sortOption);
    setCurrentPage(1);
  };

  const handleResetClick = () => {
    setSearchTerm('');
    setSelectedClub('');
    setEloMin('');
    setEloMax('');
    setSelectedDivision('');
    setSelectedTablero('');
    setSortOption('');
    setCurrentPage(1);
    fetchPlayers('', '', '', '', '', '', 1, ''); // Obtener todos los jugadores de nuevo
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setPlayers([]); // Limpiar los resultados anteriores
      console.log(`Presionando Enter para buscar: ${searchTerm}`);
      handleSearchClick();
    }
  };

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <>
      <Navbar />

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
            <option value="club">Club (alfabético)</option>
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
    </>
  );
}

export default Jugadores;
