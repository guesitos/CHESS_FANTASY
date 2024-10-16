// src/hooks/useFetchPlayersForMiEquipo.js

import { useState, useEffect } from 'react';

const useFetchPlayersForMiEquipo = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener todos los jugadores desde la base de datos
  const fetchPlayers = async () => {
    setIsLoading(true);
    setError(null);
    const url = `${process.env.REACT_APP_API_URL}/chess_players/search?limit=1000`; // Ajusta el límite según sea necesario

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener los jugadores');
      }
      const data = await response.json();
      setPlayers(data.players);
    } catch (error) {
      console.error('Error al obtener los jugadores:', error);
      setError('Hubo un problema al obtener los jugadores. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { players, isLoading, error };
};

export default useFetchPlayersForMiEquipo;
