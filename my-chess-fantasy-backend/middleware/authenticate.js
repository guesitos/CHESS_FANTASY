// middleware/authenticate.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Autenticación requerida.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjunta la información del usuario al objeto req
    next();
  } catch (error) {
    console.error('Token inválido:', error.message);
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = authenticate;
