// routes/chessPlayerRoutes.js

const express = require('express');
const { getAllPlayers, searchPlayers, getAllClubs, getAllTableros } = require('../controllers/chessPlayerController');
const router = express.Router();

// Ruta para buscar jugadores por nombre o apellido
router.get('/search', searchPlayers);

// Ruta para obtener todos los jugadores
router.get('/', getAllPlayers);

// Ruta para obtener todos los clubes únicos
router.get('/clubs', getAllClubs);

// Ruta para obtener todos los tableros únicos
router.get('/tableros', getAllTableros);

module.exports = router;
