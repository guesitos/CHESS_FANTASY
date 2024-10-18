// Reviewer.js

const { poolPlayers } = require('../db');
const winston = require('winston');
const playersList = require('../Lists/Players_list');

// Configurar winston para logs detallados
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'reviewer.log' })
  ]
});

// Función para revisar y corregir mayúsculas y minúsculas en los nombres
async function checkAndFixCapitalization() {
  try {
    logger.info('Revisando y corrigiendo capitalización de nombres...');
    const [players] = await poolPlayers.query('SELECT license_number, first_name, last_name FROM players');

    for (const player of players) {
      const updatedFirstName = player.first_name.toUpperCase();
      const updatedLastName = player.last_name.toUpperCase();

      if (player.first_name !== updatedFirstName || player.last_name !== updatedLastName) {
        await poolPlayers.query(
          'UPDATE players SET first_name = ?, last_name = ? WHERE license_number = ?',
          [updatedFirstName, updatedLastName, player.license_number]
        );
        logger.info(`Capitalización corregida para: ${updatedFirstName} ${updatedLastName}`);
      }
    }
  } catch (error) {
    logger.error('Error al revisar y corregir la capitalización de los nombres: ' + error.message);
  }
}

// Función para verificar y añadir jugadores faltantes o actualizar los que tienen datos diferentes
async function verifyAndAddMissingPlayers() {
  const connection = await poolPlayers.getConnection();
  try {
    logger.info('Verificando y añadiendo jugadores faltantes...');

    // Iniciar transacción
    await connection.beginTransaction();

    for (const player of playersList) {
      // Verificar si el jugador ya existe en la base de datos por license_number
      const [results] = await connection.query(
        `SELECT first_name, last_name, club, division, photo_url, valor, total_points
         FROM players 
         WHERE license_number = ?`,
        [player.license_number]
      );

      if (results.length > 0) {
        const dbPlayer = results[0];
        
        // Verificar si hay alguna diferencia en los datos relevantes
        const needsUpdate = 
          dbPlayer.first_name !== player.first_name.toUpperCase() ||
          dbPlayer.last_name !== player.last_name.toUpperCase() ||
          dbPlayer.club !== player.club ||
          dbPlayer.division !== player.division ||
          dbPlayer.photo_url !== (player.photo_url || null) ||
          dbPlayer.valor !== player.valor ||
          dbPlayer.total_points !== player.total_points;

        if (needsUpdate) {
          // Actualizar el jugador en caso de que existan diferencias
          await connection.query(
            `UPDATE players SET first_name = ?, last_name = ?, club = ?, division = ?, photo_url = ?, valor = ?, total_points = ?
             WHERE license_number = ?`,
            [
              player.first_name.toUpperCase(),
              player.last_name.toUpperCase(),
              player.club,
              player.division,
              player.photo_url || null,
              player.valor || 0,
              player.total_points || 0,
              player.license_number
            ]
          );
          logger.info(`Jugador actualizado: ${player.first_name.toUpperCase()} ${player.last_name.toUpperCase()}`);
        }
      } else {
        // Si el jugador no existe, insertarlo
        await connection.query(
          `INSERT INTO players (tablero, license_number, first_name, last_name, club, division, created_at, photo_url, valor, total_points)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
          [
            player.tablero,
            player.license_number,
            player.first_name.toUpperCase(),
            player.last_name.toUpperCase(),
            player.club,
            player.division,
            player.photo_url || null,
            player.valor || 0,
            player.total_points || 0
          ]
        );
        logger.info(`Jugador añadido: ${player.first_name.toUpperCase()} ${player.last_name.toUpperCase()}`);
      }
    }

    // Confirmar transacción
    await connection.commit();
    logger.info('Verificación y adición de jugadores completada exitosamente.');
  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    logger.error('Error al verificar y añadir jugadores faltantes: ' + error.message);
  } finally {
    // Liberar conexión
    connection.release();
  }
}

// Función para eliminar jugadores que no están en Players_list.js
async function removeNonMatchingPlayers() {
  try {
    logger.info('Revisando jugadores a eliminar...');

    // Crear un conjunto de números de licencia permitidos como cadenas
    const allowedLicenseNumbers = new Set(
      playersList.map(player => String(player.license_number))
    );

    // Obtener todos los jugadores de la base de datos
    const [players] = await poolPlayers.query('SELECT license_number, first_name, last_name FROM players');

    // Filtrar jugadores que no están en allowedLicenseNumbers
    const playersToDelete = players.filter(player => !allowedLicenseNumbers.has(String(player.license_number)));

    if (playersToDelete.length === 0) {
      logger.info('No hay jugadores para eliminar.');
      return;
    }

    // Mostrar jugadores que serán eliminados
    console.log('Se eliminarán los siguientes jugadores:');
    playersToDelete.forEach(player => {
      console.log(`- License Number: ${player.license_number}, Nombre: ${player.first_name} ${player.last_name}`);
    });

    // Solicitar confirmación al usuario
    const confirm = await promptUser('¿Estás seguro de que deseas eliminar estos jugadores? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      logger.info('Eliminación cancelada por el usuario.');
      return;
    }

    // Eliminar jugadores confirmados
    for (const player of playersToDelete) {
      await poolPlayers.query('DELETE FROM players WHERE license_number = ?', [String(player.license_number)]);
      logger.info(`Jugador eliminado: ${player.first_name.toUpperCase()} ${player.last_name.toUpperCase()}`);
    }

    logger.info('Eliminación de jugadores no coincidentes completada.');
  } catch (error) {
    logger.error('Error al eliminar jugadores no coincidentes: ' + error.message);
  }
}


// Exportar funciones
module.exports = {
  checkAndFixCapitalization,
  verifyAndAddMissingPlayers,
  removeNonMatchingPlayers
};
