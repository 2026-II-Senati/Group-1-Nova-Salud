const db = require('../db');

const listar = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, stock, stock_minimo
       FROM productos
       WHERE stock < stock_minimo
       ORDER BY stock ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/alertas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { listar };
