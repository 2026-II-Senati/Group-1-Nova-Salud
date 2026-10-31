const db = require('../db');

const fmt = (d) => {
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const metricas = async (req, res) => {
  try {
    const [[ventas]] = await db.query(
      'SELECT COUNT(*) AS total FROM ventas WHERE DATE(fecha) = CURDATE()'
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
    console.error('Error en GET /api/dashboard/metricas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const ventasSemana = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE(fecha) AS dia, SUM(total) AS total
       FROM ventas
       WHERE DATE(fecha) >= CURDATE() - INTERVAL 6 DAY
       GROUP BY DATE(fecha)`
    );

    const porDia = {};
    for (const row of rows) {
      // DATE() del driver llega como Date en UTC medianoche; los totales se
      // agrupan con SUM() de MySQL para que no dependa de la zona del proceso.
      const dia = row.dia instanceof Date ? row.dia : new Date(row.dia);
      const clave = dia.toISOString().slice(0, 10);
      porDia[clave] = Number(row.total);
    }

    const hoy = new Date();
    const semana = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i);
      const clave = fmt(d);
      semana.push({ fecha: clave, total: porDia[clave] || 0 });
    }

    res.json(semana);
  } catch (error) {
    console.error('Error en GET /api/dashboard/ventas-semana:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { metricas, ventasSemana };
