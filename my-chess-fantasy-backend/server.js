const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();  // Cargar variables de entorno

const app = express();

app.use(cors());  // Habilitar CORS para permitir comunicación entre frontend y backend
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

// Rutas para la gestión de usuarios
app.use('/api/users', userRoutes);

// Servidor escuchando en el puerto 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

