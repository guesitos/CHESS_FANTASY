// controllers/teamController.js

const { poolUsers } = require('../db'); // Conexión a la base de datos

// Obtener el equipo del usuario
exports.getTeam = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await poolUsers.execute('SELECT * FROM teams WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Equipo no encontrado.' });
    }
    res.json({ team: rows[0] });
  } catch (error) {
    console.error('Error al obtener el equipo:', error);
    res.status(500).json({ message: 'Error al obtener el equipo.' });
  }
};

// Guardar o actualizar el equipo del usuario
exports.saveTeam = async (req, res) => {
  const userId = req.params.userId;
  const { peones, caballos, alfiles, torres, dama, rey } = req.body;

  try {
    // Verificar si el equipo ya existe para el usuario
    const [existingTeam] = await poolUsers.execute('SELECT * FROM teams WHERE user_id = ?', [userId]);

    if (existingTeam.length > 0) {
      // Actualizar el equipo existente
      await poolUsers.execute(`
        UPDATE teams SET peones = ?, caballos = ?, alfiles = ?, torres = ?, dama = ?, rey = ?, updated_at = NOW()
        WHERE user_id = ?`, 
        [JSON.stringify(peones), JSON.stringify(caballos), JSON.stringify(alfiles), JSON.stringify(torres), JSON.stringify(dama), JSON.stringify(rey), userId]);
    } else {
      // Insertar un nuevo equipo
      await poolUsers.execute(`
        INSERT INTO teams (user_id, peones, caballos, alfiles, torres, dama, rey)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, JSON.stringify(peones), JSON.stringify(caballos), JSON.stringify(alfiles), JSON.stringify(torres), JSON.stringify(dama), JSON.stringify(rey)]);
    }

    res.status(200).json({ message: 'Equipo guardado exitosamente.' });
  } catch (error) {
    console.error('Error al guardar el equipo:', error);
    res.status(500).json({ message: 'Error al guardar el equipo.' });
  }
};
