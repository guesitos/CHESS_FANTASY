// routes/teamRoutes.js

const express = require('express');
const { getTeam, saveTeam } = require('../controllers/teamController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/:userId', authenticate, getTeam); // Obtener el equipo del usuario
router.post('/:userId', authenticate, saveTeam); // Guardar el equipo del usuario

module.exports = router;
