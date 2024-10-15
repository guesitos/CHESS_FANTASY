// routes/userRoutes.js

const express = require('express');
const { registerUser, loginUser, updateUser } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate'); // Importa el middleware de autenticación
const router = express.Router();

// Ruta para registrar usuarios
router.post('/register', registerUser);

// Ruta para login
router.post('/login', loginUser);

// Ruta para actualizar perfil de usuario (protegida)
router.put('/update', authenticate, updateUser);

module.exports = router;
