const db = require('../db');
const { responderError, traducirErrorBase, asyncHandler } = require('../utils/errors');

const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

const esFechaReal = (valor) => {
  if (!formatoFecha.test(valor)) {
    return false;
  }
  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio
    && fecha.getUTCMonth() === mes - 1
    && fecha.getUTCDate() === dia;
};

const listar = asyncHandler(async (req, res) => {
  const { desde, hasta } = req.query;

  if ((desde && !esFechaReal(desde)) || (hasta && !esFechaReal(hasta))) {
    return responderError(res, 400, 'Las fechas deben tener formato YYYY-MM-DD');
  }

  if (desde && hasta && desde > hasta) {
    return responderError(res, 400, 'La fecha "desde" no puede ser posterior a "hasta"');
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
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/movimientos:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

module.exports = { listar };
