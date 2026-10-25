const db = require('../db');

const listar = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre FROM categorias');
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/categorias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { listar };
