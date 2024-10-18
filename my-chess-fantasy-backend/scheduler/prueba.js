// testUpdateEloValor.js
const { updateAllPlayersEloValor } = require('../controllers/chessPlayerController');

(async () => {
  try {
    await updateAllPlayersEloValor();
    console.log('Actualización de ELO y Valor de Mercado completada.');
  } catch (error) {
    console.error('Error durante la actualización:', error);
  }
})();