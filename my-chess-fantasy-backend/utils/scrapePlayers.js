// utils/scrapePlayers.js

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const winston = require('winston');
const { spawn } = require('child_process');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const { poolPlayers } = require('../db');
require('dotenv').config();

// Configurar winston para logs detallados
const logger = winston.createLogger({
  level: 'debug', // Cambiado a 'debug' para mayor detalle
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'scrape_players.log' })
  ]
});

// Función para normalizar cadenas
function normalizeString(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .toUpperCase()
    .replace(/[^A-Z\s\-']/g, '') // Permite guiones y apóstrofes
    .replace(/\s+/g, ' ') // Reemplaza múltiples espacios por uno solo
    .trim();
}

// Función para ejecutar el script de Python
function runPythonScript() {
  return new Promise((resolve, reject) => {
    logger.info('Ejecutando el script de Python para procesar el XML...');
    const env = { ...process.env }; // Pasamos las variables de entorno

    // Construir la ruta absoluta al script de Python
    const pythonScriptPath = path.resolve(__dirname, '../Lists/Crear_tabla_players_fide.py');
    
    const pythonProcess = spawn('python3', [pythonScriptPath], { env });

    // Captura de salida estándar
    pythonProcess.stdout.on('data', (data) => {
      logger.info(`Salida del script de Python: ${data.toString()}`);
    });

    // Captura de errores (stderr)
    pythonProcess.stderr.on('data', (data) => {
      const message = data.toString();
      if (message.includes('[ERROR]')) {
        logger.error(`Error del script de Python: ${message}`);
      } else {
        logger.info(`Salida del script de Python: ${message}`);
      }
    });

    // Manejar el cierre del proceso
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        logger.info('Script de Python ejecutado con éxito.');
        resolve();
      } else {
        logger.error(`El script de Python terminó con código de salida: ${code}`);
        reject(new Error(`El script de Python terminó con código de salida: ${code}`));
      }
    });
  });
}

// Función para buscar el FIDE ID en la tabla 'fide_players' y verificar nombres
async function searchInFideList(connection, player, fullName) {
  // Normalizar el nombre del jugador
  const playerFirstNameNormalized = normalizeString(player.first_name);
  const playerLastNameNormalized = normalizeString(player.last_name);

  // Buscar en la tabla fide_players
  const [rows] = await connection.execute(
    'SELECT fide_id, first_name_normalized, last_name_normalized FROM fide_players WHERE first_name_normalized = ? AND last_name_normalized = ?',
    [playerFirstNameNormalized, playerLastNameNormalized]
  );

  if (rows.length > 0) {
    const fideId = parseInt(rows[0].fide_id, 10);
    const fideFirstName = rows[0].first_name_normalized;
    const fideLastName = rows[0].last_name_normalized;
    logger.info(`FIDE ID encontrado en la lista FIDE para ${fullName}: ${fideId}`);

    // Verificar si el fide_id ya existe, excluyendo al jugador actual
    const [existing] = await connection.execute(
      'SELECT 1 FROM players WHERE fide_id = ? AND license_number != ?',
      [fideId, player.license_number]
    );

    if (existing.length > 0) {
      logger.warn(`FIDE ID ${fideId} ya está asignado a otro jugador. No se puede asignar a ${fullName}.`);
      
      // No actualizar el fide_id, retornar que no se pudo asignar
      return { fideIdFound: false };
    }

    // Verificar discrepancias en nombres antes de actualizar
    const dbFirstNameNormalized = normalizeString(player.first_name);
    const dbLastNameNormalized = normalizeString(player.last_name);

    if (dbFirstNameNormalized !== fideFirstName || dbLastNameNormalized !== fideLastName) {
      // Hay discrepancias, no actualizar el fide_id y reportar la discrepancia
      logger.warn(`Discrepancia en nombres para ${fullName}. No se actualizará el fide_id.`);
      return {
        fideIdFound: false,
        discrepancy: {
          license_number: player.license_number,
          fullNameDB: `${player.first_name} ${player.last_name}`,
          fullNameFIDE: `${fideFirstName} ${fideLastName}`
        }
      };
    }

    // Nombres coinciden, actualizar el fide_id en la tabla players
    await connection.execute(
      'UPDATE players SET fide_id = ?, fide_id_check = 1 WHERE license_number = ?',
      [fideId, player.license_number]
    );
    logger.info(`FIDE ID para ${fullName} actualizado correctamente en la base de datos.`);

    // No hay discrepancias
    return { fideIdFound: true };
  } else {
    logger.warn(`No se encontró FIDE ID para ${fullName} en la lista FIDE.`);
    return { fideIdFound: false };
  }
}

// Función principal
async function scrapePlayers() {
  let connection;
  let browser;
  try {
    // Configuración de la base de datos utilizando variables de entorno
    const dbConfig = {
      host: process.env.DB_CHESS_HOST || 'localhost',
      user: process.env.DB_CHESS_USER || 'chess_user',
      password: process.env.DB_CHESS_PASSWORD,
      database: process.env.DB_CHESS_NAME || 'chess_players_db',
      port: process.env.DB_CHESS_PORT || 3306
    };

    logger.info('Comenzando el proceso de búsqueda de FIDE IDs...');

    // Ejecutar el script de Python antes de continuar
    await runPythonScript();

    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);

    // Obtener los jugadores sin fide_id
    const [players] = await connection.execute(`
      SELECT license_number, first_name, last_name 
      FROM players 
      WHERE fide_id IS NULL OR fide_id = ''
    `);

    // Inicializar listas para discrepancias y extracciones fallidas
    const discrepantPlayers = [];
    const failedExtractionPlayers = [];

    logger.info(`Total de jugadores sin fide_id o con fide_id vacío: ${players.length}`);

    if (players.length === 0) {
      logger.info('No hay jugadores sin fide_id o con fide_id vacío para procesar.');
      return;
    }

    // Configurar Puppeteer
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Configurar un User-Agent personalizado
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36');

    for (const player of players) {
      // Normalizar nombres
      const firstName = normalizeString(player.first_name);
      const lastName = normalizeString(player.last_name);
      const fullName = `${firstName} ${lastName}`;

      logger.info(`Buscando FIDE ID para: ${fullName}`);

      // Construir la URL de búsqueda en Google
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent('site:ratings.fide.com/profile ' + fullName)}`;

      try {
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Esperar a que aparezca el contenido de los resultados de búsqueda
        await page.waitForSelector('div', { timeout: 5000 });

        // Obtener el contenido HTML de la página de resultados de Google
        const content = await page.content();
        const $ = cheerio.load(content);

        // Buscar el enlace que contiene el perfil FIDE
        const fideLink = $('a').filter((i, el) => {
          const href = $(el).attr('href');
          return href && href.includes('ratings.fide.com/profile') && href.match(/\/profile\/(\d+)/);
        }).first();

        const fideIdMatch = fideLink.attr('href') ? fideLink.attr('href').match(/\/profile\/(\d+)/) : null;

        if (fideIdMatch) {
          const fideId = fideIdMatch[1];
          logger.info(`FIDE ID encontrado para ${fullName}: ${fideId}`);

          // Verificar si el fide_id ya existe, excluyendo al jugador actual
          const [existing] = await connection.execute(
            'SELECT 1 FROM players WHERE fide_id = ? AND license_number != ?',
            [fideId, player.license_number]
          );

          if (existing.length > 0) {
            logger.warn(`FIDE ID ${fideId} ya está asignado a otro jugador. No se puede asignar a ${fullName}.`);
            continue; // Continuar con el siguiente jugador
          }

          // Verificar los nombres obtenidos del perfil FIDE antes de actualizar
          // Aquí podrías agregar una función para obtener el nombre del jugador desde ratings.fide.com usando el fideId
          // Por simplicidad, usaremos la función searchInFideList para verificar
          const result = await searchInFideList(connection, player, fullName);

          if (result.fideIdFound) {
            // FIDE ID encontrado y verificado, ya se actualizó en searchInFideList
            if (result.discrepancy) {
              discrepantPlayers.push(result.discrepancy);
            }
          } else {
            // No se pudo verificar el fide_id, no actualizar
            logger.warn(`No se pudo verificar el FIDE ID ${fideId} para ${fullName}. No se actualizará el fide_id.`);
          }
        } else {
          logger.warn(`No se encontró FIDE ID para ${fullName} en la búsqueda de Google.`);
          // Intentar buscar en la lista FIDE
          const result = await searchInFideList(connection, player, fullName);
          if (result.fideIdFound) {
            if (result.discrepancy) {
              discrepantPlayers.push(result.discrepancy);
            }
            // FIDE ID encontrado y actualizado en searchInFideList
          } else {
            // Asignar NULL si no se encontró el fide_id
            await connection.execute(
              'UPDATE players SET fide_id = NULL WHERE license_number = ?',
              [player.license_number]
            );
            logger.info(`fide_id establecido como NULL para ${fullName} debido a la falta de FIDE ID.`);
            failedExtractionPlayers.push({
              license_number: player.license_number,
              first_name: player.first_name,
              last_name: player.last_name
            });
          }
        }
      } catch (searchError) {
        logger.error(`Error al buscar FIDE ID para ${fullName} en Google: ${searchError.message}`);
        // Intentar buscar en la lista FIDE
        try {
          const result = await searchInFideList(connection, player, fullName);
          if (result.fideIdFound) {
            if (result.discrepancy) {
              discrepantPlayers.push(result.discrepancy);
            }
            // FIDE ID encontrado y actualizado en searchInFideList
          } else {
            // Asignar NULL si no se encontró el fide_id
            await connection.execute(
              'UPDATE players SET fide_id = NULL WHERE license_number = ?',
              [player.license_number]
            );
            logger.info(`fide_id establecido como NULL para ${fullName} debido a la falta de FIDE ID después de un error.`);
            failedExtractionPlayers.push({
              license_number: player.license_number,
              first_name: player.first_name,
              last_name: player.last_name
            });
          }
        } catch (listError) {
          logger.error(`Error al buscar en la lista FIDE para ${fullName}: ${listError.message}`);
          // Asignar NULL si ocurre un error al buscar en la lista FIDE
          try {
            await connection.execute(
              'UPDATE players SET fide_id = NULL WHERE license_number = ?',
              [player.license_number]
            );
            logger.info(`fide_id establecido como NULL para ${fullName} debido a errores en la lista FIDE.`);
            failedExtractionPlayers.push({
              license_number: player.license_number,
              first_name: player.first_name,
              last_name: player.last_name
            });
          } catch (assignError) {
            logger.error(`Error al asignar fide_id NULL al jugador ${fullName}: ${assignError.message}`);
          }
        }
      }
    }

    // Mostrar listas de discrepancias y extracciones fallidas en la consola
    if (discrepantPlayers.length > 0) {
      console.log('Jugadores con discrepancias en nombre obtenido con la base de datos:');
      discrepantPlayers.forEach(player => {
        console.log(`- License Number: ${player.license_number}, DB Name: ${player.fullNameDB}, FIDE Name: ${player.fullNameFIDE}`);
      });
    } else {
      console.log('No se encontraron discrepancias en los nombres de los jugadores.');
    }

    if (failedExtractionPlayers.length > 0) {
      console.log('\nJugadores que han sido asignados con fide_id NULL debido a fallos en la extracción de ID FIDE:');
      failedExtractionPlayers.forEach(player => {
        console.log(`- License Number: ${player.license_number}, Name: ${player.first_name} ${player.last_name}`);
      });
    } else {
      console.log('No se asignaron fide_id NULL a ningún jugador por fallos en la extracción de ID FIDE.');
    }
  } catch (error) {
    logger.error('Error durante el proceso de búsqueda de FIDE IDs: ' + error.message);
  } finally {
    if (browser) {
      await browser.close();
      logger.info('Navegador de Puppeteer cerrado.');
    }
    if (connection) {
      await connection.end();
      logger.info('Conexión a la base de datos cerrada.');
    }
  }
}

// Exportar la función
module.exports = scrapePlayers;

// Ejecutar la función principal si el script se ejecuta directamente
if (require.main === module) {
  scrapePlayers();
}
