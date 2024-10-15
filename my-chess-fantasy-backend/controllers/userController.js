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

    // Insertar usuario en la base de datos sin la columna 'equipo'
    const [result] = await poolUsers.query(
      'INSERT INTO users (email, password, username, team_name, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, username, teamName, firstName, lastName]
    );

    const userId = result.insertId; // Obtener el ID del usuario insertado
    console.log('Usuario registrado con éxito:', email);

    // Generar JWT
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Responder con user y token, sin 'equipo'
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

// Función para login de usuarios
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

    // Responder con user y token, sin 'equipo'
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

// Función para actualizar perfil de usuario
const updateUser = async (req, res) => {
  try {
    console.log('Datos recibidos para actualizar perfil:', req.body);
    const { firstName, lastName, teamName } = req.body;

    // Validar que los campos requeridos están presentes
    if (!firstName || !lastName || !teamName) {
      return res.status(400).json({ message: 'Todos los campos editables son requeridos.' });
    }

    // Obtener el ID del usuario desde el token
    const userId = req.user.id;

    // Verificar si el usuario existe en la base de datos
    const [users] = await poolUsers.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Actualizar los campos permitidos en la base de datos
    const [result] = await poolUsers.query(
      'UPDATE users SET first_name = ?, last_name = ?, team_name = ? WHERE id = ?',
      [firstName, lastName, teamName, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'No se pudo actualizar el perfil.' });
    }

    // Recuperar los datos actualizados del usuario
    const [updatedUsers] = await poolUsers.query('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedUser = updatedUsers[0];

    // Generar un nuevo token
    const newToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Responder con el usuario actualizado y el nuevo token
    res.status(200).json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        teamName: updatedUser.team_name,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
      },
      token: newToken,
    });
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

module.exports = { registerUser, loginUser, updateUser };
