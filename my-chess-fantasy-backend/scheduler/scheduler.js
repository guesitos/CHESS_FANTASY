// scheduler/scheduler.js

const cron = require('node-cron');
const scrapePlayers = require('../utils/scrapePlayers'); // Asegúrate de que la ruta es correcta
const { 
  updateAllPlayersEloValor, 
  fetchProblematicPlayers
} = require('../controllers/chessPlayerController');
const { 
  checkAndFixCapitalization, 
  verifyAndAddMissingPlayers, 
  removeNonMatchingPlayers 
} = require('../utils/Reviewer');

require('dotenv').config(); // Cargar variables de entorno

// Función para mostrar jugadores problemáticos
const showProblematicPlayers = async () => {
  try {
    const { nullPlayers, emptyPlayers, duplicatePlayers } = await fetchProblematicPlayers();

    // Mostrar jugadores con fide_id NULL
    if (nullPlayers.length > 0) {
      console.log('\nJugadores con fide_id NULL:');
      nullPlayers.forEach(player => {
        console.log(`- Nombre: ${player.first_name} ${player.last_name}, License: ${player.license_number}`);
      });
    } else {
      console.log('\nNo hay jugadores con fide_id NULL.');
    }

    // Mostrar jugadores con fide_id vacío
    if (emptyPlayers.length > 0) {
      console.log('\nJugadores con fide_id vacío:');
      emptyPlayers.forEach(player => {
        console.log(`- Nombre: ${player.first_name} ${player.last_name}, License: ${player.license_number}`);
      });
    } else {
      console.log('\nNo hay jugadores con fide_id vacío.');
    }

    // Mostrar jugadores con fide_id duplicado
    if (duplicatePlayers.length > 0) {
      console.log('\nJugadores con fide_id duplicado:');
      duplicatePlayers.forEach(player => {
        console.log(`- FIDE ID: ${player.fide_id}, Nombre: ${player.first_name} ${player.last_name}, License: ${player.license_number}`);
      });
    } else {
      console.log('\nNo hay jugadores con fide_id duplicado.');
    }

  } catch (error) {
    console.error('Error al obtener jugadores problemáticos:', error);
  }
};

// Función para realizar tareas iniciales
async function runInitialTasks() {
  try {
    console.log('Iniciando revisión de capitalización y verificación de jugadores...');
    await checkAndFixCapitalization();
    await verifyAndAddMissingPlayers();
    await removeNonMatchingPlayers();
    console.log('Revisión y verificación de jugadores completada.');

    console.log('Iniciando scraping y actualización del ELO FIDE y valor de mercado...');
    await scrapePlayers();
    await updateAllPlayersEloValor();
    console.log('Actualización inicial de ELO FIDE y valor de mercado completada.');

    // Mostrar la lista de jugadores problemáticos
    await showProblematicPlayers();

  } catch (error) {
    console.error('Error durante las tareas iniciales:', error);
  }
}

// Programar tareas
function scheduleTasks() {
  // Actualización diaria a las 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Ejecutando actualización diaria de ELO FIDE y valor de mercado de jugadores');
    try {
      await updateAllPlayersEloValor();
      console.log('Actualización diaria completada.');

      // Mostrar la lista de jugadores problemáticos
      await showProblematicPlayers();

    } catch (error) {
      console.error('Error durante la actualización diaria:', error);
    }
  });

  // Scraping mensual el día 3 a las 0:00 AM
  cron.schedule('0 0 3 * *', async () => {
    console.log('Iniciando scraping mensual de jugadores...');
    try {
      await scrapePlayers();
      await updateAllPlayersEloValor();
      console.log('Scraping y actualización mensual completada.');

      // Mostrar la lista de jugadores problemáticos
      await showProblematicPlayers();

    } catch (error) {
      console.error('Error durante el scraping mensual:', error);
    }
  });
}

// Ejecutar tareas iniciales y programar cron jobs
(async () => {
  await runInitialTasks();
  scheduleTasks();
})();
