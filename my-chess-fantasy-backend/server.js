// server.js

const express = require('express');
const cors = require('cors');
const readline = require('readline'); // Importar readline para la interacción en la terminal
const morgan = require('morgan'); // Opcional: Para registro de solicitudes
const helmet = require('helmet'); // Opcional: Para mejorar la seguridad
const userRoutes = require('./routes/userRoutes');
const chessPlayerRoutes = require('./routes/chessPlayerRoutes'); // Importar las rutas de jugadores
const { poolUsers, poolPlayers } = require('./db'); // Importar las conexiones desde db.js
require('dotenv').config();  // Cargar variables de entorno

const fideScraper = require('fide-ratings-scraper'); // Importar el scraper
const scrapePlayers = require('./scrapePlayers');
const { 
  updateAllPlayersEloValor, 
  getAllClubs, 
  getAllTableros 
} = require('./controllers/chessPlayerController');
const { 
  checkAndFixCapitalization, 
  verifyAndAddMissingPlayers, 
  removeNonMatchingPlayers 
} = require('./Reviewer'); // Importar funciones de Reviewer

const cron = require('node-cron'); // Para tareas programadas

const app = express();

// Opcional: Mejorar la seguridad con helmet
app.use(helmet());

// Opcional: Registrar solicitudes HTTP con morgan
app.use(morgan('combined'));

// Configuración de CORS más específica con whitelist
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001']; // Añade aquí otros orígenes si es necesario

app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (como mobile apps o curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política de CORS para este sitio no permite el acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

// Middleware para manejo de errores (Opcional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
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
  rl.question('¿Desea realizar la revisión, scraping y actualización del ELO FIDE y valor de mercado? (sí/no): ', async (answer) => {
    if (['sí', 'si', 'y', 'yes'].includes(answer.toLowerCase())) {
      try {
        console.log('Iniciando revisión de capitalización y verificación de jugadores...');
        await checkAndFixCapitalization();
        await verifyAndAddMissingPlayers();
        await removeNonMatchingPlayers(); // Eliminar jugadores obsoletos que no están en Players_list.js
        console.log('Revisión y verificación de jugadores completada. Iniciando scraping y actualización del ELO FIDE y valor de mercado...');
        await scrapePlayers();
        console.log('Scraping inicial de jugadores completado. Iniciando actualización del ELO FIDE y valor de mercado...');
        await updateAllPlayersEloValor(); // Actualiza ELO y valor utilizando el script Python
        console.log('Actualización inicial de ELO FIDE y valor de mercado completada.');
      } catch (error) {
        console.error('Error al realizar la revisión, scraping inicial o la actualización del ELO FIDE y valor de mercado:', error);
      }
    } else {
      console.log('Actualización cancelada.');
    }

    // Cerrar la interfaz de readline
    rl.close();
  });

  console.log('Configurado el cron job para actualizaciones diarias a las 2 AM.');
});
