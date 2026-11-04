const db = require('../db');
const { responderError, traducirErrorBase, asyncHandler } = require('../utils/errors');
const { hoyLima, restarDias } = require('../utils/fecha');

const fmt = (d) => {
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const metricas = asyncHandler(async (req, res) => {
  try {
    const [[ventas]] = await db.query(
      'SELECT COUNT(*) AS total FROM ventas WHERE DATE(fecha) = ?',
      [hoyLima()]
    );
    const [[productos]] = await db.query(
      'SELECT COUNT(*) AS total FROM productos'
    );
    const [[bajoStock]] = await db.query(
      'SELECT COUNT(*) AS total FROM productos WHERE stock < stock_minimo'
    );

    res.json({
      ventas_hoy: Number(ventas.total),
      total_productos: Number(productos.total),
      productos_bajo_stock: Number(bajoStock.total)
    });
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/dashboard/metricas:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const ventasSemana = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS dia, SUM(total) AS total
       FROM ventas
       WHERE DATE(fecha) >= ?
       GROUP BY DATE_FORMAT(fecha, '%Y-%m-%d')`,
      [restarDias(hoyLima(), 6)]
    );

    const porDia = {};
    for (const row of rows) {
      porDia[row.dia] = Number(row.total);
    }

    const semana = [];
    for (let i = 6; i >= 0; i--) {
      const clave = restarDias(hoyLima(), i);
      semana.push({ fecha: clave, total: porDia[clave] || 0 });
    }

    res.json(semana);
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/dashboard/ventas-semana:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});


module.exports = { metricas, ventasSemana };
