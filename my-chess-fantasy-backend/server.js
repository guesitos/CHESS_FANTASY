// server.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Opcional: Para registro de solicitudes
const helmet = require('helmet'); // Opcional: Para mejorar la seguridad
const userRoutes = require('./routes/userRoutes');
const chessPlayerRoutes = require('./routes/chessPlayerRoutes'); // Importar las rutas de jugadores
const teamRoutes = require('./routes/teamRoutes'); // Importar las rutas de equipos
const { poolUsers, poolPlayers } = require('./db'); // Importar las conexiones desde db/index.js
require('dotenv').config();  // Cargar variables de entorno

const fideScraper = require('fide-ratings-scraper'); // Importar el scraper
const { getAllClubs, getAllTableros } = require('./controllers/chessPlayerController');
const { 
  checkAndFixCapitalization, 
  verifyAndAddMissingPlayers, 
  removeNonMatchingPlayers 
} = require('./utils/Reviewer'); // Importar funciones de Reviewer

const app = express();

// Seguridad y Logs
app.use(helmet());
app.use(morgan('combined'));

// Configuración de CORS
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

// Log de solicitudes (redundante si usas morgan, pero puede ser útil para mensajes personalizados)
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/chess_players', chessPlayerRoutes); // Ruta para jugadores
app.use('/api/teams', teamRoutes); // Nueva ruta para equipos

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

// Ruta para manejar GET / y evitar el error 404
app.get('/', (req, res) => {
  res.status(200).send('¡Servidor backend de Chess Fantasy está funcionando!');
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Si el error es de CORS, manejarlo de manera diferente
  if (err instanceof Error && err.message.includes('CORS')) {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).send('Algo salió mal!');
});

// Servidor escuchando
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
