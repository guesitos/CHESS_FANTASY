// src/hooks/useFetchPlayers.js

import { useState, useEffect } from 'react';

const useFetchPlayers = () => {
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
  const [error, setError] = useState(null);

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
    setError(null); // Resetear error antes de una nueva búsqueda
    let url = `${process.env.REACT_APP_API_URL}/chess_players/search`;

    // Construir la URL con los filtros
    const params = new URLSearchParams();
    if (searchTerm && searchTerm.trim() !== '') params.append('searchTerm', searchTerm);
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
      .catch(error => {
        console.error('Error al obtener los jugadores:', error);
        setError('Hubo un problema al buscar jugadores. Por favor, intenta de nuevo.');
      })
      .finally(() => setIsLoading(false));
  };

  // Función para obtener clubes desde la base de datos
  const fetchClubs = () => {
    fetch(`${process.env.REACT_APP_API_URL}/chess_players/clubs`)
      .then(response => response.json())
      .then(data => setClubs(data))
      .catch(error => console.error('Error al obtener los clubes:', error));
  };

  // Función para obtener tableros desde la base de datos
  const fetchTableros = () => {
    fetch(`${process.env.REACT_APP_API_URL}/chess_players/tableros`)
      .then(response => response.json())
      .then(data => setTableros(data))
      .catch(error => console.error('Error al obtener los tableros:', error));
  };

  // useEffect para obtener jugadores cuando cambian los filtros, página o sort
  useEffect(() => {
    fetchPlayers(searchTerm, selectedClub, eloMin, eloMax, selectedDivision, selectedTablero, currentPage, sortOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedClub, eloMin, eloMax, selectedDivision, selectedTablero, currentPage, sortOption]);

  // useEffect para obtener clubes y tableros al montar el hook
  useEffect(() => {
    fetchClubs();
    fetchTableros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Maneja el evento de búsqueda
  const handleSearchClick = () => {
    setPlayers([]); // Limpiar los resultados anteriores antes de iniciar la nueva búsqueda
    console.log(`Iniciando búsqueda con el término: ${searchTerm}`);
    fetchPlayers(searchTerm, selectedClub, eloMin, eloMax, selectedDivision, selectedTablero, 1, sortOption);
    setCurrentPage(1);
  };

  // Maneja el evento de restablecer filtros
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

  // Maneja la pulsación de la tecla Enter en el campo de búsqueda
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setPlayers([]); // Limpiar los resultados anteriores
      console.log(`Presionando Enter para buscar: ${searchTerm}`);
      handleSearchClick();
    }
  };

  // Alterna la visibilidad de la búsqueda avanzada
  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(!showAdvancedSearch);
  };

  // Maneja la navegación a la página anterior
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Maneja la navegación a la página siguiente
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Maneja el cambio en la opción de ordenamiento
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return {
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
    setCurrentPage,
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
  };
};

export default useFetchPlayers;
