// scheduler.js
const cron = require('node-cron');
const scrapePlayers = require('./scrapePlayers'); // Asegúrate de que la ruta es correcta
const { updateAllPlayersElo } = require('./controllers/chessPlayerController');

// Programar el scraping para buscar jugadores y actualizar el ELO FIDE
// Esto se ejecutará el día 3 de cada mes a las 0:00 AM
cron.schedule('0 0 3 * *', async () => {
  console.log('Iniciando scraping programado para buscar jugadores a las 0:00 AM del día 3 de cada mes...');
  await scrapePlayers();
  console.log('Scraping de jugadores completado. Iniciando actualización del ELO FIDE...');
  await updateAllPlayersElo();
  console.log('Actualización de ELO FIDE completada.');
});

// Ejecutar scraping y actualización de ELO FIDE al iniciar el servidor
(async () => {
  console.log('Iniciando scraping y actualización de ELO FIDE al iniciar el servidor...');
  await scrapePlayers();
  console.log('Scraping de jugadores completado. Iniciando actualización del ELO FIDE...');
  await updateAllPlayersElo();
  console.log('Actualización de ELO FIDE completada al iniciar el servidor.');
})();