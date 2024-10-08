// routes/chessPlayerRoutes.js

const express = require('express');
const { getAllPlayers } = require('../controllers/chessPlayerController');
const router = express.Router();

// Ruta para obtener todos los jugadores
router.get('/', getAllPlayers);

module.exports = router;
