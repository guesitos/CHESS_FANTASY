// scheduler.js

const cron = require('node-cron');
const scrapePlayers = require('./scrapePlayers'); // Asegúrate de que la ruta es correcta

// Programar el scraping para que se ejecute todos los días a las 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('Iniciando scraping programado a las 2 AM...');
  scrapePlayers();
});
