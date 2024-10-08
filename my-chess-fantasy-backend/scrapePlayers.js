// scrapePlayers.js

const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const util = require('util');
const { poolPlayers } = require('./db'); // Asegúrate de que esta ruta es correcta

// Promisificar exec para usar async/await
const execPromise = util.promisify(exec);

/**
 * Función para obtener el ELO FIDE de un jugador dado su FIDE ID
 * Utiliza fide-ratings-scraper mediante child_process
 * @param {string} fideId - El ID FIDE del jugador
 * @returns {Promise<string>} - El ELO FIDE o '-' en caso de error
 */
async function getPlayerElo(fideId) {
  try {
    const { stdout, stderr } = await execPromise(`fide-ratings-scraper get elo ${fideId}`);
    if (stderr) {
      console.error(`Error ejecutando scraper para FIDE ID ${fideId}:`, stderr);
      return '-';
    }
    const data = JSON.parse(stdout);
    return data.standard_elo || '-';
  } catch (error) {
    console.error(`Error obteniendo ELO para FIDE ID ${fideId}:`, error.message);
    return '-';
  }
}

/**
 * Función principal para realizar el scraping y actualizar la base de datos
 */
async function scrapePlayers() {
  try {
    // URL de la página que deseas scrapear
    const URL = 'https://xefega.fegaxa.org/index.php/index/index/'; // Reemplaza con la URL real si es diferente

    // Hacer una solicitud HTTP para obtener el contenido de la página
    const { data } = await axios.get(URL);

    // Cargar el HTML en Cheerio
    const $ = cheerio.load(data);

    let currentClub = 'BENCHOSHEY PEREIRO DE AGUIAR'; // Valor por defecto
    let currentDivision = 'División de Honor'; // Valor por defecto

    // Iterar sobre cada fila dentro de .container-fluid
    $('.container-fluid > .row').each((i, row) => {
      const alertDiv = $(row).find('.alert.alert-success, .alert.alert-warning').text().trim();

      // Detectar cambios en club o división
      if (alertDiv) {
        if (alertDiv.toLowerCase().includes('división de honra') || alertDiv.toLowerCase().includes('división de honor')) {
          currentDivision = 'División de Honor';
        } else {
          currentClub = alertDiv; // Asignar el nombre del club
        }
      }

      // Buscar tablas con la clase 'results' dentro de esta fila
      $(row).find('table.results').each(async (j, table) => {
        // Iterar sobre cada fila de la tabla
        $(table).find('tbody tr').each(async (k, playerRow) => {
          const columns = $(playerRow).find('td');

          const tableroText = $(columns[0]).text().trim();
          const tablero = parseInt(tableroText, 10);
          const license_number = $(columns[1]).text().trim();
          const first_name = $(columns[2]).text().trim();
          const last_name = $(columns[3]).text().trim();
          // const elo_fide_table = $(columns[4]).text().trim(); // Ya no necesitamos este campo

          // Validar que los campos necesarios no estén vacíos
          if (!license_number || !first_name || !last_name) {
            console.warn(`Datos incompletos para jugador en tablero ${tableroText}, saltando.`);
            return;
          }

          // Validaciones adicionales
          if (isNaN(tablero) || tablero <= 0) {
            console.warn(`Número de tablero inválido (${tableroText}) para jugador ${first_name} ${last_name}, saltando.`);
            return;
          }

          if (!/^\d+$/.test(license_number)) {
            console.warn(`Número de licencia inválido (${license_number}) para jugador ${first_name} ${last_name}, saltando.`);
            return;
          }

          // Crear un objeto jugador
          const player = {
            tablero,
            fide_id: null, // Inicialmente null, se actualizará más adelante
            license_number, // Usaremos este campo para verificar la existencia
            first_name,
            last_name,
            club: currentClub, // Asignar el club basado en la fila actual
            division: currentDivision, // Asignar la división basada en la fila actual
            photo_url: null, // Inicialmente null, se puede actualizar más tarde
            valor: 0, // Inicializado en 0, se calculará posteriormente
            total_points: 0, // Inicializado en 0, se calculará posteriormente
            created_at: new Date(),
          };

          try {
            // Verificar si el jugador ya existe en la base de datos basado en license_number
            const [existingPlayers] = await poolPlayers.query('SELECT * FROM players WHERE license_number = ?', [player.license_number]);

            if (existingPlayers.length > 0) {
              // Jugador ya existe, actualizar campos necesarios (ej. club, división)
              console.log(`Jugador con License Number ${player.license_number} ya existe, actualizando información.`);

              await poolPlayers.query(
                'UPDATE players SET first_name = ?, last_name = ?, club = ?, division = ?, updated_at = ? WHERE license_number = ?',
                [player.first_name, player.last_name, player.club, player.division, new Date(), player.license_number]
              );
              console.log(`Información para License Number ${player.license_number} actualizada correctamente.`);
            } else {
              // Jugador no existe, insertar nuevo registro
              console.log(`Jugador ${player.first_name} ${player.last_name} no existe, insertando.`);

              // No tenemos fide_id ahora, lo dejamos como NULL
              await poolPlayers.query('INSERT INTO players SET ?', player);
              console.log(`Jugador ${player.first_name} ${player.last_name} insertado con éxito.`);
            }
          } catch (dbError) {
            console.error(`Error al insertar/actualizar jugador ${player.first_name} ${player.last_name}:`, dbError);
          }
        });
      });
    });

    console.log('Scraping completado.');
  } catch (error) {
    console.error('Error al realizar el scraping:', error.message);
  }
}

// Exportar la función scrapePlayers para usarla en el scheduler si es necesario
module.exports = scrapePlayers;

// Ejecutar la función de scraping si el script se ejecuta directamente
if (require.main === module) {
  scrapePlayers();
}