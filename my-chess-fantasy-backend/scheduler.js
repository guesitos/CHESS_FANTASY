// scheduler.js

const cron = require('node-cron');
const scrapePlayers = require('./scrapePlayers'); // Asegúrate de que la ruta es correcta
const { updateAllPlayersEloValor } = require('./controllers/chessPlayerController');

// Programar el scraping para buscar jugadores y actualizar el ELO FIDE y valor de mercado
// Esto se ejecutará todos los días a las 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Ejecutando actualización diaria de ELO FIDE y valor de mercado de jugadores');
  try {
    await updateAllPlayersEloValor();
    console.log('Actualización diaria de ELO FIDE y valor de mercado completada.');
  } catch (error) {
    console.error('Error durante la actualización diaria de ELO FIDE y valor de mercado:', error);
  }
});

// Programar el scraping mensual para el día 3 de cada mes a las 0:00 AM
cron.schedule('0 0 3 * *', async () => {
  console.log('Iniciando scraping programado para buscar jugadores a las 0:00 AM del día 3 de cada mes...');
  try {
    await scrapePlayers();
    console.log('Scraping de jugadores completado. Iniciando actualización del ELO FIDE y valor de mercado...');
    await updateAllPlayersEloValor();
    console.log('Actualización de ELO FIDE y valor de mercado completada.');
  } catch (error) {
    console.error('Error durante el scraping programado y actualización:', error);
  }
});

// Ejecutar scraping y actualización de ELO FIDE y valor de mercado al iniciar el scheduler
(async () => {
  console.log('Iniciando scraping y actualización de ELO FIDE y valor de mercado al iniciar el scheduler...');
  try {
    await scrapePlayers();
    console.log('Scraping de jugadores completado. Iniciando actualización del ELO FIDE y valor de mercado...');
    await updateAllPlayersEloValor();
    console.log('Actualización de ELO FIDE y valor de mercado completada al iniciar el scheduler.');
  } catch (error) {
    console.error('Error durante el scraping inicial y actualización al iniciar el scheduler:', error);
  }
})();
