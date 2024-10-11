// routes/chessPlayerRoutes.js

const express = require('express');
const { getAllPlayers, searchPlayers } = require('../controllers/chessPlayerController');
const router = express.Router();

// Ruta para obtener todos los jugadores
router.get('/', getAllPlayers);

// Ruta para buscar jugadores por nombre o apellido
router.get('/search', searchPlayers);

module.exports = router;
