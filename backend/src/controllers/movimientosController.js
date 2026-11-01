const db = require('../db');

const listar = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, producto_id, tipo, cantidad, fecha
       FROM movimientos
       ORDER BY fecha DESC, id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/movimientos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { listar };
