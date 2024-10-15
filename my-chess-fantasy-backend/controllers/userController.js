// controllers/userController.js

const { poolUsers } = require('../db'); // Importar poolUsers desde db/index.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Cargar variables de entorno

// Función para registrar usuarios
const registerUser = async (req, res) => {
  try {
    console.log('Datos recibidos para el registro:', req.body);
    const { email, password, username, teamName, firstName, lastName } = req.body;

    // Verificar que todos los campos están definidos
    if (!email || !password || !username || !teamName || !firstName || !lastName) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el correo ya está registrado
    const [existingUsers] = await poolUsers.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      console.error('El correo ya está registrado:', email);
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // Verificar si el nombre de usuario ya está registrado
    const [existingUsernames] = await poolUsers.query('SELECT * FROM users WHERE username = ?', [username]);

    if (existingUsernames.length > 0) {
      console.error('El nombre de usuario ya está en uso:', username);
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en la base de datos con los nuevos campos
    const [result] = await poolUsers.query(
      'INSERT INTO users (email, password, username, team_name, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, username, teamName, firstName, lastName]
    );

    const userId = result.insertId; // Obtener el ID del usuario insertado
    console.log('Usuario registrado con éxito:', email);

    // Generar JWT
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Responder con user y token, incluyendo los nuevos campos
    res.status(201).json({
      user: {
        id: userId,
        email,
        username,
        teamName,
        firstName,
        lastName,
      },
      token,
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Función para login de usuarios (sin cambios necesarios)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Datos recibidos para login:', { email });

    // Verificar que los campos están definidos
    if (!email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el correo está registrado
    const [users] = await poolUsers.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      console.error('Correo no encontrado:', email);
      return res.status(400).json({ message: 'Correo no encontrado.' });
    }

    const user = users[0];

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Contraseña incorrecta para el usuario:', email);
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    // Si todo es correcto, generar JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Responder con user y token, incluyendo los nuevos campos
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        teamName: user.team_name,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

module.exports = { registerUser, loginUser };
