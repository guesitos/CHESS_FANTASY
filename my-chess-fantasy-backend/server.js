const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();  // Cargar variables de entorno

const app = express();

// Configuración de CORS más específica
app.use(cors({
  origin: '*',  // Permite todas las solicitudes, para desarrollo únicamente
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware para parsear JSON
app.use(express.json());

// Log de solicitudes
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Conectar a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a MySQL exitosa');
});

// Rutas para la gestión de usuarios
app.use('/api/users', userRoutes);

// Servidor escuchando en el puerto 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


