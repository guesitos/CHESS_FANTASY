// scheduler/scheduler.js

const cron = require('node-cron');
const scrapePlayers = require('../utils/scrapePlayers'); // Asegúrate de que la ruta es correcta
const { updateAllPlayersEloValor } = require('../controllers/chessPlayerController');
const { 
  checkAndFixCapitalization, 
  verifyAndAddMissingPlayers, 
  removeNonMatchingPlayers 
} = require('../utils/Reviewer');

require('dotenv').config(); // Cargar variables de entorno

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
