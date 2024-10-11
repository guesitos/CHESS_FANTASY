// server.js

const express = require('express');
const cors = require('cors');
const readline = require('readline'); // Importar readline para la interacción en la terminal
const userRoutes = require('./routes/userRoutes');
const chessPlayerRoutes = require('./routes/chessPlayerRoutes'); // Importar las rutas de jugadores
const { poolUsers, poolPlayers } = require('./db'); // Importar las conexiones desde db.js
require('dotenv').config();  // Cargar variables de entorno

const fideScraper = require('fide-ratings-scraper'); // Importar el scraper
const scrapePlayers = require('./scrapePlayers');
const { updateAllPlayersElo } = require('./controllers/chessPlayerController');
const { checkAndFixCapitalization, verifyAndAddMissingPlayers, removeNonMatchingPlayers } = require('./Reviewer'); // Importar funciones de Reviewer

const app = express();

// Configuración de CORS más específica
app.use(cors({
  origin: '*',  // Permite todas las solicitudes, para desarrollo únicamente
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware para parsear JSON
app.use(express.json());

// Log de solicitudes
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Rutas para la gestión de usuarios
app.use('/api/users', userRoutes);

// Rutas para la gestión de jugadores
app.use('/api/chess_players', chessPlayerRoutes); // Nueva ruta para jugadores

// Endpoint para obtener información detallada del jugador usando el ID FIDE
app.get('/api/chess_players/details', async (req, res) => {
  const { fideId } = req.query;

  if (!fideId) {
    return res.status(400).send('Debe proporcionar el ID FIDE');
  }

  try {
    // Obtener información completa del jugador usando el fide-ratings-scraper
    const playerInfo = await fideScraper.get('info', fideId);
    res.json(playerInfo);
  } catch (error) {
    console.error('Error al obtener la información del jugador:', error);
    res.status(500).send('Error en el servidor al obtener información del jugador');
  }
});

// Servidor escuchando en el puerto 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);

  // Crear la interfaz para la interacción con el usuario
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Preguntar al usuario si desea realizar la actualización
  rl.question('¿Desea realizar la revisión, scraping y actualización del ELO FIDE? (sí/no): ', async (answer) => {
    if (answer.toLowerCase() === 'sí' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      try {
        console.log('Iniciando revisión de capitalización y verificación de jugadores...');
        await checkAndFixCapitalization();
        await verifyAndAddMissingPlayers();
        await removeNonMatchingPlayers(); // Eliminar jugadores obsoletos que no están en Players_list.js
        console.log('Revisión y verificación de jugadores completada. Iniciando scraping y actualización del ELO FIDE...');
        await scrapePlayers();
        console.log('Scraping inicial de jugadores completado. Iniciando actualización del ELO FIDE...');
        await updateAllPlayersElo();
        console.log('Actualización inicial de ELO FIDE completada.');
      } catch (error) {
        console.error('Error al realizar la revisión, scraping inicial o la actualización del ELO FIDE:', error);
      }
    } else {
      console.log('Actualización cancelada.');
    }

    // Cerrar la interfaz de readline
    rl.close();
  });
});
