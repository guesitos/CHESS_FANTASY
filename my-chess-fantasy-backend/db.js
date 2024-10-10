// db.js

const mysql = require('mysql2/promise');
require('dotenv').config();  // Cargar variables de entorno

// Crear un pool de conexiones para usuarios
const poolUsers = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Crear un pool de conexiones para jugadores
const poolPlayers = mysql.createPool({
  host: process.env.DB_CHESS_HOST,
  user: process.env.DB_CHESS_USER,
  password: process.env.DB_CHESS_PASSWORD,
  database: process.env.DB_CHESS_NAME,
  port: process.env.DB_CHESS_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exportar los pools
module.exports = { poolUsers, poolPlayers };
