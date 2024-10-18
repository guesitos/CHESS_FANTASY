// controllers/chessPlayerController.js

const { poolPlayers } = require('../db'); // Importar el pool de conexiones
const { exec } = require('child_process'); // Importar exec para ejecutar comandos
const path = require('path'); // Para manejar rutas de archivos

// Función para buscar jugadores por varios filtros
const searchPlayers = async (req, res) => {
  const { searchTerm, club, eloMin, eloMax, division, tablero, page = 1, limit = 20, sort } = req.query;

  console.log(`Término de búsqueda recibido: ${searchTerm}, club: ${club}, ELO mínimo: ${eloMin}, ELO máximo: ${eloMax}, división: ${division}, tablero: ${tablero}, página: ${page}, límite: ${limit}, orden: ${sort}`);

  const offset = (page - 1) * limit;

  let query = `SELECT *, CASE WHEN elo_fide = 'NotRated' THEN 0 ELSE CAST(elo_fide AS SIGNED) END AS elo_fide_numeric FROM players WHERE 1=1`;
  const params = [];

  if (searchTerm && searchTerm.trim() !== '') {
    query += ` AND (first_name LIKE ? OR last_name LIKE ?)`;
    params.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  if (club && club.trim() !== '') {
    query += ` AND club = ?`;
    params.push(club);
  }

  if (eloMin && eloMin.trim() !== '') {
    query += ` AND elo_fide_numeric >= ?`;
    params.push(Number(eloMin));
  }

  if (eloMax && eloMax.trim() !== '') {
    query += ` AND elo_fide_numeric <= ?`;
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

  // Agregar la lógica de ordenación
  if (sort && sort.trim() !== '') {
    switch (sort) {
      case 'elo':
        query += ` ORDER BY elo_fide_numeric DESC`;
        break;
      case 'club':
        query += ` ORDER BY club ASC`;
        break;
      case 'apellido':
        query += ` ORDER BY last_name ASC`;
        break;
      case 'puntos_jornada':
        query += ` ORDER BY points_jornada_1 DESC`;
        break;
      case 'puntos_totales':
        query += ` ORDER BY total_points DESC`;
        break;
      default:
        break;
    }
  } else {
    query += ` ORDER BY last_name ASC`; // Orden predeterminado
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

    if (searchTerm && searchTerm.trim() !== '') {
      totalPlayersQuery += ` AND (first_name LIKE ? OR last_name LIKE ?)`;
      totalParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (club && club.trim() !== '') {
      totalPlayersQuery += ` AND club = ?`;
      totalParams.push(club);
    }

    if (eloMin && eloMin.trim() !== '') {
      totalPlayersQuery += ` AND CASE WHEN elo_fide = 'NotRated' THEN 0 ELSE CAST(elo_fide AS SIGNED) END >= ?`;
      totalParams.push(Number(eloMin));
    }

    if (eloMax && eloMax.trim() !== '') {
      totalPlayersQuery += ` AND CASE WHEN elo_fide = 'NotRated' THEN 0 ELSE CAST(elo_fide AS SIGNED) END <= ?`;
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

// Función para obtener todos los jugadores
const getAllPlayers = async (req, res) => {
  let connection;
  try {
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para obtener todos los jugadores');
    const [results] = await connection.query('SELECT * FROM players');
    results.forEach(player => {
      player.first_name = player.first_name.toUpperCase();
      player.last_name = player.last_name.toUpperCase();
    });
    res.json(results);
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    res.status(500).send('Error en el servidor al obtener jugadores');
  } finally {
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada después de obtener jugadores');
  }
};

// Función para obtener todos los clubes únicos
const getAllClubs = async (req, res) => {
  let connection;
  try {
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para obtener todos los clubes');
    const [results] = await connection.query('SELECT DISTINCT club FROM players ORDER BY club ASC');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener clubes:', error);
    res.status(500).send('Error en el servidor al obtener clubes');
  } finally {
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada después de obtener clubes');
  }
};

// Función para obtener todos los tableros únicos
const getAllTableros = async (req, res) => {
  let connection;
  try {
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para obtener todos los tableros');
    const [results] = await connection.query('SELECT DISTINCT tablero FROM players ORDER BY tablero ASC');
    res.json(results);
  } catch (error) {
    console.error('Error al obtener tableros:', error);
    res.status(500).send('Error en el servidor al obtener tableros');
  } finally {
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada después de obtener tableros');
  }
};

// Función para obtener jugadores con fide_id NULL, vacío o duplicados
const fetchProblematicPlayers = async () => {
  let connection;
  try {
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para obtener jugadores problemáticos');

    // Jugadores con fide_id NULL
    const [nullPlayers] = await connection.query(`
      SELECT fide_id, first_name, last_name, license_number, tablero, club, division, created_at
      FROM players
      WHERE fide_id IS NULL
    `);

    // Jugadores con fide_id vacío
    const [emptyPlayers] = await connection.query(`
      SELECT fide_id, first_name, last_name, license_number, tablero, club, division, created_at
      FROM players
      WHERE fide_id = ''
    `);

    // Jugadores con fide_id duplicados
    const [duplicatePlayers] = await connection.query(`
      SELECT p.fide_id, p.first_name, p.last_name, p.license_number, p.tablero, p.club, p.division, p.created_at
      FROM players p
      INNER JOIN (
        SELECT fide_id
        FROM players
        WHERE fide_id IS NOT NULL AND fide_id != ''
        GROUP BY fide_id
        HAVING COUNT(*) > 1
      ) dup ON p.fide_id = dup.fide_id
      ORDER BY p.fide_id ASC, p.license_number ASC
    `);

    return { nullPlayers, emptyPlayers, duplicatePlayers };
  } catch (error) {
    console.error('Error al obtener jugadores problemáticos:', error);
    throw error;
  } finally {
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada después de obtener jugadores problemáticos');
  }
};

// Función para obtener el ELO FIDE de un jugador dado su FIDE ID
function getPlayerElo(fideId) {
  return new Promise((resolve, reject) => {
    exec(`fide-ratings-scraper get elo ${fideId}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando el scraper para FIDE ID ${fideId}:`, stderr);
        resolve(null);
      } else {
        try {
          const data = JSON.parse(stdout.trim());
          resolve(data.standard_elo || null);
        } catch (parseError) {
          console.error(`Error parseando la respuesta del scraper para FIDE ID ${fideId}:`, parseError);
          resolve(null);
        }
      }
    });
  });
}

// Función para obtener el Valor de Mercado de un jugador usando el script Python
const getPlayerValor = (fideId) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../Values/valor_mercado_jugadores.py');
    const command = `python3 "${scriptPath}" "${fideId}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error ejecutando el script para fide_id ${fideId}:`, stderr);
        return resolve(null); // Retornar null o un valor por defecto en caso de error
      }
      try {
        const valor = parseFloat(stdout.trim());
        resolve(isNaN(valor) ? null : valor);
      } catch (parseError) {
        console.error(`Error parseando la salida del script para fide_id ${fideId}:`, parseError);
        resolve(null);
      }
    });
  });
};

// Función para actualizar el ELO FIDE y valor de mercado de todos los jugadores
const updateAllPlayersEloValor = async () => {
  let connection;

  try {
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para actualizar el ELO FIDE y valor de mercado');

    // Seleccionar solo jugadores con fide_id numérico y no NULL ni vacío
    const [players] = await connection.query(`
      SELECT fide_id FROM players 
      WHERE fide_id IS NOT NULL AND fide_id != '' AND fide_id REGEXP '^[0-9]+$'
    `);

    for (const player of players) {
      const fideId = player.fide_id;
      
      // Obtener el ELO FIDE
      const eloFide = await getPlayerElo(fideId);
      
      // Obtener el valor de mercado utilizando el script Python
      const valor = await getPlayerValor(fideId);
      
      if (eloFide !== null && valor !== null) {
        await connection.query(
          'UPDATE players SET elo_fide = ?, valor = ?, first_name = UPPER(first_name), last_name = UPPER(last_name) WHERE fide_id = ?',
          [eloFide, valor, fideId]
        );
        console.log(`Actualizado fide_id: ${fideId} - ELO FIDE: ${eloFide}, Valor: ${valor}`);
      } else {
        console.log(`No se pudo actualizar fide_id: ${fideId} - ELO FIDE: ${eloFide}, Valor: ${valor}`);
      }
    }
  } catch (error) {
    console.error('Error al actualizar el ELO FIDE y valor de mercado de los jugadores:', error);
  } finally {
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada después de la actualización del ELO FIDE y valor de mercado');
  }
};

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

// **Nueva función** para actualizar el valor a 0 para jugadores con EloFIDE 'Not Rated'
const setNotRatedPlayersValorToZero = async () => {
  let connection;
  try {
    connection = await poolPlayers.getConnection();
    console.log('Conexión a la base de datos obtenida para actualizar valor de jugadores NotRated');

    const [result] = await connection.query(
      "UPDATE players SET valor = 0 WHERE elo_fide = 'Not Rated' OR elo_fide IS NULL OR elo_fide = ''"
    );

    console.log(`Se han actualizado ${result.affectedRows} jugadores NotRated a valor 0.`);
  } catch (error) {
    console.error('Error al actualizar valor de jugadores NotRated:', error);
  } finally {
    if (connection) connection.release();
    console.log('Conexión a la base de datos liberada después de actualizar valor de jugadores NotRated');
  }
};

// Exportar las funciones del controlador
module.exports = {
  getAllPlayers,
  fetchAllPlayers,
  updateAllPlayersEloValor, // Nueva función para actualizar ELO y valor
  searchPlayers,
  getAllClubs,
  getAllTableros,
  fetchProblematicPlayers, // Nueva función para obtener jugadores problemáticos (Null, vacios y duplicados)
  setNotRatedPlayersValorToZero
};
