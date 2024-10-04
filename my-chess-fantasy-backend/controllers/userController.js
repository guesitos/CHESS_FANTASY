const bcrypt = require('bcrypt');
const mysql = require('mysql2');  // Cambia esto para usar mysql2 en lugar de mysql
require('dotenv').config();  // Asegúrate de cargar dotenv para leer las variables de entorno

// Configura la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,  // Usamos el puerto de la variable de entorno o el 3306 por defecto
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

  // Verificar si las contraseñas coinciden
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Las contraseñas no coinciden' });
  }

  // Verificar si el correo ya está registrado
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error al buscar el correo:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Encriptar la contraseña antes de guardarla
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error al encriptar la contraseña:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      // Insertar usuario en la base de datos
      db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
        if (err) {
          console.error('Error al insertar el usuario:', err);
          return res.status(500).json({ message: 'Error en el servidor' });
        }
        res.status(201).json({ message: 'Usuario registrado con éxito' });
      });
    });
  });
};

// Función para login de usuarios
const loginUser = (req, res) => {
  const { email, password } = req.body;

  // Verificar si el correo está registrado
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error al buscar el correo:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Correo no encontrado' });
    }

    // Verificar la contraseña
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
      }

      // Si todo es correcto, responder con éxito
      res.status(200).json({ message: 'Inicio de sesión exitoso' });
    });
  });
};

module.exports = { registerUser, loginUser };
