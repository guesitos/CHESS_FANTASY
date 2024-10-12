// controllers/chessPlayerController.js

const { poolPlayers } = require('../db'); // Importar el pool de conexiones
const { exec } = require('child_process'); // Importar exec para ejecutar comandos

// Función para buscar jugadores por varios filtros
const searchPlayers = async (req, res) => {
  const { search, club, eloMin, eloMax, division, tablero, page = 1, limit = 20 } = req.query;

  console.log(`Término de búsqueda recibido: ${search}, club: ${club}, ELO mínimo: ${eloMin}, ELO máximo: ${eloMax}, división: ${division}, tablero: ${tablero}, página: ${page}, límite: ${limit}`);

  const offset = (page - 1) * limit;

  let query = `SELECT * FROM players WHERE 1=1`;
  const params = [];

  if (search && search.trim() !== '') {
    query += ` AND (first_name LIKE ? OR last_name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (club && club.trim() !== '') {
    query += ` AND club = ?`;
    params.push(club);
  }

  if (eloMin && eloMin.trim() !== '') {
    query += ` AND elo_fide >= ?`;
    params.push(Number(eloMin));
  }

  if (eloMax && eloMax.trim() !== '') {
    query += ` AND elo_fide <= ?`;
    params.push(Number(eloMax));
  }

  if (division && division.trim() !== '') {
    query += ` AND division = ?`;
    params.push(division);
  }

  if (tablero && tablero.trim() !== '') {
    query += ` AND tablero = ?`;
    params.push(Number(tablero));
  }

  query += ` LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  let connection;

  try {
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para búsqueda de jugadores');

    // Realizar la consulta
    const [results] = await connection.query(query, params);

    // Calcular el total de páginas
    let totalPlayersQuery = `SELECT COUNT(*) as count FROM players WHERE 1=1`;
    const totalParams = [];

    if (search && search.trim() !== '') {
      totalPlayersQuery += ` AND (first_name LIKE ? OR last_name LIKE ?)`;
      totalParams.push(`%${search}%`, `%${search}%`);
    }

    if (club && club.trim() !== '') {
      totalPlayersQuery += ` AND club = ?`;
      totalParams.push(club);
    }

    if (eloMin && eloMin.trim() !== '') {
      totalPlayersQuery += ` AND elo_fide >= ?`;
      totalParams.push(Number(eloMin));
    }

    if (eloMax && eloMax.trim() !== '') {
      totalPlayersQuery += ` AND elo_fide <= ?`;
      totalParams.push(Number(eloMax));
    }

    if (division && division.trim() !== '') {
      totalPlayersQuery += ` AND division = ?`;
      totalParams.push(division);
    }

    if (tablero && tablero.trim() !== '') {
      totalPlayersQuery += ` AND tablero = ?`;
      totalParams.push(Number(tablero));
    }

    const [totalResults] = await connection.query(totalPlayersQuery, totalParams);
    const totalPlayers = totalResults[0].count;
    const totalPages = Math.ceil(totalPlayers / limit);

    res.json({ players: results, totalPages });
  } catch (err) {
    console.error('Error al buscar los jugadores en la base de datos:', err);
    res.status(500).send('Error en el servidor');
  } finally {
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada');
  }
};

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
  let connection;

  try {
    // Obtener una conexión del pool
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para actualizar el ELO FIDE');

    const [results] = await connection.query('SELECT * FROM players');

    // Actualizar el ELO FIDE de cada jugador
    for (const player of results) {
      if (player.fide_id) {
        const eloFide = await getPlayerElo(player.fide_id);
        await connection.query('UPDATE players SET elo_fide = ?, first_name = UPPER(first_name), last_name = UPPER(last_name) WHERE fide_id = ?', [eloFide, player.fide_id]);
        console.log(`ELO FIDE actualizado para el jugador ${player.first_name} ${player.last_name}: ${eloFide}`);
      }
    }
  } catch (error) {
    console.error('Error al actualizar el ELO FIDE de los jugadores:', error);
  } finally {
    // Liberar la conexión después de realizar la actualización
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada después de la actualización del ELO FIDE');
  }
}

// Función para obtener todos los jugadores sin depender de req y res
async function fetchAllPlayers() {
  let connection;

  try {
    // Obtener una conexión del pool
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para obtener todos los jugadores');

    const [results] = await connection.query('SELECT * FROM players');
    results.forEach(player => {
      player.first_name = player.first_name.toUpperCase();
      player.last_name = player.last_name.toUpperCase();
    });
    return results;
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    throw error;
  } finally {
    // Liberar la conexión después de la consulta
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada después de obtener jugadores');
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

// Función para obtener todos los clubes únicos
async function getAllClubs(req, res) {
  let connection;
  try {
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para obtener todos los clubes');
    const [results] = await connection.query('SELECT DISTINCT club FROM players');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener clubes:', error);
    res.status(500).send('Error en el servidor al obtener clubes');
  } finally {
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada después de obtener clubes');
  }
}

// Función para obtener todos los tableros únicos
async function getAllTableros(req, res) {
  let connection;
  try {
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para obtener todos los tableros');
    const [results] = await connection.query('SELECT DISTINCT tablero FROM players');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener tableros:', error);
    res.status(500).send('Error en el servidor al obtener tableros');
  } finally {
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada después de obtener tableros');
  }
}

// Exportar las funciones del controlador
module.exports = {
  getAllPlayers,
  fetchAllPlayers,
  updateAllPlayersElo,
  searchPlayers,
  getAllClubs,
  getAllTableros,
};