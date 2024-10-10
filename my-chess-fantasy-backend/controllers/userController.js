// controllers/userController.js
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
require('dotenv').config();  // Asegúrate de cargar dotenv para leer las variables de entorno

// Configura la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// Conectar a la base de datos y manejar errores
db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a MySQL exitosa');
});

// Función para registrar usuarios
const registerUser = (req, res) => {
  const { email, password, confirmPassword } = req.body;

  console.log('Datos recibidos para el registro:', { email, password, confirmPassword });

  // Verificar que todos los campos están definidos
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  // Verificar si las contraseñas coinciden
  if (password !== confirmPassword) {
    console.error('Las contraseñas no coinciden');
    return res.status(400).json({ message: 'Las contraseñas no coinciden' });
  }

  // Verificar si el correo ya está registrado
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error al buscar el correo en la base de datos:', err);
      return res.status(500).json({ message: 'Error en el servidor al buscar el correo.' });
    }

    if (results.length > 0) {
      console.error('El correo ya está registrado:', email);
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // Encriptar la contraseña antes de guardarla
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error al encriptar la contraseña:', err);
        return res.status(500).json({ message: 'Error en el servidor al encriptar la contraseña.' });
      }

      // Insertar usuario en la base de datos
      db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
        if (err) {
          console.error('Error al insertar el usuario en la base de datos:', err);
          return res.status(500).json({ message: 'Error en el servidor al insertar el usuario.' });
        }
        console.log('Usuario registrado con éxito:', email);
        res.status(201).json({ message: 'Usuario registrado con éxito.' });
      });
    });
  });
};

// Función para login de usuarios
const loginUser = (req, res) => {
  const { email, password } = req.body;

  console.log('Datos recibidos para login:', { email });

  // Verificar que los campos están definidos
  if (!email || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  // Verificar si el correo está registrado
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error al buscar el correo en la base de datos:', err);
      return res.status(500).json({ message: 'Error en el servidor al buscar el correo.' });
    }

    if (results.length === 0) {
      console.error('Correo no encontrado:', email);
      return res.status(400).json({ message: 'Correo no encontrado.' });
    }

    // Verificar la contraseña
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return res.status(500).json({ message: 'Error en el servidor al comparar las contraseñas.' });
      }

      if (!isMatch) {
        console.error('Contraseña incorrecta para el usuario:', email);
        return res.status(400).json({ message: 'Contraseña incorrecta.' });
      }

      // Si todo es correcto, responder con éxito
      console.log('Inicio de sesión exitoso:', email);
      res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    });
  });
};

module.exports = { registerUser, loginUser };