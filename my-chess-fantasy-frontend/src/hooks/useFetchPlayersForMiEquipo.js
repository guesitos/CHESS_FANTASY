// src/hooks/useFetchPlayersForMiEquipo.js

import { useState, useEffect, useCallback } from 'react';

const useFetchPlayersForMiEquipo = (division) => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const url = `${process.env.REACT_APP_API_URL}/chess_players/search?division=${encodeURIComponent(division)}&limit=1000`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener los jugadores');
      }
      const data = await response.json();
      console.log('Datos de jugadores recibidos:', data);
      setPlayers(data.players || []); // Asegurarse de que "players" sea un array
    } catch (error) {
      console.error('Error al obtener los jugadores:', error);
      setError('Hubo un problema al obtener los jugadores. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [division]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return { players, isLoading, error };
};

export default useFetchPlayersForMiEquipo;
