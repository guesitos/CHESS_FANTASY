// controllers/chessPlayerController.js

const { poolPlayers } = require('../db'); // Importar el pool de conexiones
const { exec } = require('child_process'); // Importar exec para ejecutar comandos

// Función para obtener el ELO FIDE de un jugador dado su FIDE ID
function getPlayerElo(fideId) {
  return new Promise((resolve, reject) => {
    exec(`fide-ratings-scraper get elo ${fideId}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando el scraper para FIDE ID ${fideId}:`, stderr);
        resolve('-');
      } else {
        try {
          const data = JSON.parse(stdout);
          resolve(data.standard_elo || '-');
        } catch (parseError) {
          console.error(`Error parseando la respuesta del scraper para FIDE ID ${fideId}:`, parseError);
          resolve('-');
        }
      }
    });
  });
}

// Actualizar el ELO FIDE de todos los jugadores
async function updateAllPlayersElo() {
  try {
    const [results] = await poolPlayers.query('SELECT * FROM players');

    // Actualizar el ELO FIDE de cada jugador
    for (const player of results) {
      if (player.fide_id) {
        const eloFide = await getPlayerElo(player.fide_id);
        await poolPlayers.query('UPDATE players SET elo_fide = ?, first_name = UPPER(first_name), last_name = UPPER(last_name) WHERE fide_id = ?', [eloFide, player.fide_id]);
        console.log(`ELO FIDE actualizado para el jugador ${player.first_name} ${player.last_name}: ${eloFide}`);
      }
    }
  } catch (error) {
    console.error('Error al actualizar el ELO FIDE de los jugadores:', error);
  }
}

// Función para obtener todos los jugadores sin depender de req y res
async function fetchAllPlayers() {
  try {
    const [results] = await poolPlayers.query('SELECT * FROM players');
    results.forEach(player => {
      player.first_name = player.first_name.toUpperCase();
      player.last_name = player.last_name.toUpperCase();
    });
    return results;
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    throw error;
  }
}

// Obtener todos los jugadores y devolver su información (como controlador de ruta)
async function getAllPlayers(req, res) {
  try {
    const results = await fetchAllPlayers();
    res.json(results);
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    res.status(500).send('Error en el servidor al obtener jugadores');
  }
}

// Exportar las funciones del controlador
module.exports = {
  getAllPlayers,
  fetchAllPlayers,
  updateAllPlayersElo,
};
