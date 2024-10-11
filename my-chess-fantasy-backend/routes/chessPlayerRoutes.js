// routes/chessPlayerRoutes.js

const express = require('express');
const { getAllPlayers, searchPlayers } = require('../controllers/chessPlayerController');
const router = express.Router();

// Ruta para buscar jugadores por nombre o apellido
router.get('/search', searchPlayers);

// Ruta para obtener todos los jugadores
router.get('/', getAllPlayers);

module.exports = router;

