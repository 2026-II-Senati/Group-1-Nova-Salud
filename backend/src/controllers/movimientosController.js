const db = require('../db');

const listar = async (req, res) => {
  const { desde, hasta } = req.query;
  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

  if ((desde && !formatoFecha.test(desde)) || (hasta && !formatoFecha.test(hasta))) {
    return res.status(400).json({ message: 'Las fechas deben tener formato YYYY-MM-DD' });
  }

  try {
    let sql = `SELECT m.id, m.producto_id, p.nombre AS producto,
                  m.tipo, m.cantidad, m.fecha
           FROM movimientos m
           INNER JOIN productos p ON m.producto_id = p.id`;

    const params = [];

    if (desde && hasta) {
      sql += ' WHERE DATE(fecha) BETWEEN ? AND ?';
      params.push(desde, hasta);
    } else if (desde) {
      sql += ' WHERE DATE(fecha) >= ?';
      params.push(desde);
    } else if (hasta) {
      sql += ' WHERE DATE(fecha) <= ?';
      params.push(hasta);
    }

    sql += ' ORDER BY fecha DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/movimientos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


module.exports = { listar };
