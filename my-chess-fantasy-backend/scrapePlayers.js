// scrapePlayers.js

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const winston = require('winston');
const { exec } = require('child_process'); // Importamos 'exec' para ejecutar el script de Python
const mysql = require('mysql2/promise');
require('dotenv').config(); // Cargar variables de entorno

// Configurar winston para logs detallados
const logger = winston.createLogger({
  level: 'debug',
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
    .replace(/[^A-Z\s]/g, '') // Elimina caracteres no alfabéticos
    .replace(/\s+/g, ' ') // Reemplaza múltiples espacios por uno solo
    .trim();
}

const { spawn } = require('child_process');

// Función para ejecutar el script de Python
function runPythonScript() {
  return new Promise((resolve, reject) => {
    logger.info('Ejecutando el script de Python para procesar el XML...');
    const env = { ...process.env }; // Pasamos las variables de entorno

    const pythonProcess = spawn('python3', ['./Lists/Crear_tabla_players_fide.py'], { env });

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


// Función principal
async function scrapePlayers() {
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
    const connection = await mysql.createConnection(dbConfig);

    // Obtener los jugadores sin fide_id de la base de datos
    const [players] = await connection.execute('SELECT license_number, first_name, last_name FROM players WHERE fide_id IS NULL');

    // Configurar Puppeteer
    const browser = await puppeteer.launch({ headless: true });
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
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

        // Esperar a que aparezca el contenido de los resultados de búsqueda
        await page.waitForSelector('div');

        // Obtener el contenido HTML de la página de resultados de Google
        const content = await page.content();
        const $ = cheerio.load(content);

        // Buscar el enlace que contiene el perfil FIDE
        const fideLink = $('a').filter((i, el) => {
          const href = $(el).attr('href');
          return href && href.includes('ratings.fide.com/profile') && href.match(/\/profile\/\d+/);
        }).first();

        const fideIdMatch = fideLink.attr('href') ? fideLink.attr('href').match(/\/profile\/(\d+)/) : null;

        if (fideIdMatch) {
          const fideId = fideIdMatch[1];
          logger.info(`FIDE ID encontrado para ${fullName}: ${fideId}`);

          // Actualizar el fide_id en la base de datos
          await connection.execute(
            'UPDATE players SET fide_id = ? WHERE license_number = ?',
            [fideId, player.license_number]
          );
          logger.info(`FIDE ID para ${fullName} actualizado correctamente en la base de datos.`);
        } else {
          logger.warn(`No se encontró FIDE ID para ${fullName} en la búsqueda de Google.`);
          // Intentar buscar en la lista FIDE
          await searchInFideList(connection, player, fullName);
        }
      } catch (searchError) {
        logger.error(`Error al buscar FIDE ID para ${fullName} en Google: ${searchError.message}`);
        // Intentar buscar en la lista FIDE
        await searchInFideList(connection, player, fullName);
      }
    }

    await browser.close();
    await connection.end();
    logger.info('Proceso de búsqueda de FIDE IDs completado.');
  } catch (error) {
    logger.error('Error durante el proceso de búsqueda de FIDE IDs: ' + error.message);
  }
}

// Función para buscar el FIDE ID en la tabla 'fide_players'
async function searchInFideList(connection, player, fullName) {
  // La tabla 'fide_players' ya debería estar actualizada por el script de Python

  // Normalizar el nombre del jugador
  const playerFirstNameNormalized = normalizeString(player.first_name);
  const playerLastNameNormalized = normalizeString(player.last_name);

  // Buscar en la tabla fide_players
  const [rows] = await connection.execute(
    'SELECT fide_id FROM fide_players WHERE first_name_normalized = ? AND last_name_normalized = ?',
    [playerFirstNameNormalized, playerLastNameNormalized]
  );

  if (rows.length > 0) {
    const fideId = rows[0].fide_id;
    logger.info(`FIDE ID encontrado en la lista FIDE para ${fullName}: ${fideId}`);

    // Actualizar el fide_id en la tabla players
    await connection.execute(
      'UPDATE players SET fide_id = ? WHERE license_number = ?',
      [fideId, player.license_number]
    );
    logger.info(`FIDE ID para ${fullName} actualizado correctamente en la base de datos.`);
  } else {
    logger.warn(`No se encontró FIDE ID para ${fullName} en la lista FIDE.`);
  }
}

// Exportar la función
module.exports = scrapePlayers;

// Ejecutar la función principal si el script se ejecuta directamente
if (require.main === module) {
  scrapePlayers();
}