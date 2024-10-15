// src/context/PlayersContext.js

import React, { createContext } from 'react';
import useFetchPlayers from '../hooks/useFetchPlayers';

// Crear el contexto
export const PlayersContext = createContext();

// Crear el proveedor del contexto
export const PlayersProvider = ({ children }) => {
  const playersData = useFetchPlayers();

  return (
    <PlayersContext.Provider value={playersData}>
      {children}
    </PlayersContext.Provider>
  );
};
