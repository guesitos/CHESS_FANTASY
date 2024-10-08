// controllers/chessPlayerController.js

const { dbPlayers } = require('../db'); // Importar la conexión a la base de datos desde db.js
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

// Obtener todos los jugadores y actualizar su ELO FIDE
async function getAllPlayers(req, res) {
  try {
    // Cambiar 'fide_players' por 'players' si esa es la tabla correcta
    dbPlayers.query('SELECT * FROM players', async (err, results) => {
      if (err) {
        console.error('Error al obtener jugadores:', err);
        return res.status(500).send('Error en el servidor al obtener jugadores');
      }

      // Actualizar el ELO FIDE de cada jugador
      const playersWithElo = await Promise.all(
        results.map(async (player) => {
          if (player.fide_id) {
            player.elo_fide = await getPlayerElo(player.fide_id);
          } else {
            player.elo_fide = '-';
          }
          return player;
        })
      );

      res.json(playersWithElo);
    });
  } catch (error) {
    console.error('Error al procesar jugadores:', error);
    res.status(500).send('Error en el servidor');
  }
}

// Exportar las funciones del controlador
module.exports = {
  getAllPlayers,
};

