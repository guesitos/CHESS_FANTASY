// server.js

const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const chessPlayerRoutes = require('./routes/chessPlayerRoutes'); // Importar las rutas de jugadores
const { dbUsers, dbPlayers } = require('./db'); // Importar las conexiones desde db.js
require('dotenv').config();  // Cargar variables de entorno

const fideScraper = require('fide-ratings-scraper'); // Importar el scraper

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

// Endpoint para buscar jugador por nombre y apellido
app.get('/api/chess_players/search', (req, res) => {
  const { firstName, lastName } = req.query;

  if (!firstName || !lastName) {
    return res.status(400).send('Debe proporcionar nombre y apellido');
  }

  const query = 'SELECT * FROM fide_players WHERE first_name = ? AND last_name = ?';
  dbPlayers.query(query, [firstName, lastName], (err, results) => {
    if (err) {
      console.error('Error al buscar el jugador en la base de datos:', err);
      res.status(500).send('Error en el servidor');
    } else if (results.length === 0) {
      res.status(404).send('Jugador no encontrado');
    } else {
      res.json(results[0]);
    }
  });
});

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
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
