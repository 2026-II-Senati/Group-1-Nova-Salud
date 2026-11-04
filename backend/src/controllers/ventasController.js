const db = require('../db');
const { responderError, traducirErrorBase, asyncHandler } = require('../utils/errors');
const { hoyLima, restarDias, ahoraLima } = require('../utils/fecha');


const idValido = (valor) => {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// Error de la propia logica de venta: siempre es un dato invalido del usuario.
class ErrorVenta extends Error {}

const registrar = asyncHandler(async (req, res) => {
  const { usuario_id, productos } = req.body || {};

  const usuarioIdNum = idValido(usuario_id);

  if (usuarioIdNum === null || !Array.isArray(productos) || productos.length === 0) {
    return responderError(res, 400, 'usuario_id y productos son requeridos');
  }

  if (productos.length > 100) {
    return responderError(res, 400, 'Una venta no puede tener más de 100 productos distintos');
  }

  for (const item of productos) {
    if (!item || typeof item !== 'object') {
      return responderError(res, 400, 'Cada producto debe ser un objeto con producto_id y cantidad');
    }

    if (idValido(item.producto_id) === null || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      return responderError(res, 400, 'Cada producto debe tener producto_id y una cantidad entera mayor a cero');
    }

    if (item.cantidad > 100000) {
      return responderError(res, 400, 'La cantidad de un producto no puede superar 100000');
    }
  }

  const agrupados = {};
  for (const item of productos) {
    const clave = idValido(item.producto_id);
    agrupados[clave] = (agrupados[clave] || 0) + item.cantidad;
  }

  const items = Object.entries(agrupados).map(([id, cantidad]) => ({
    producto_id: Number(id),
    cantidad
  }));

  let conexion;

  try {
    conexion = await db.getConnection();
  } catch (error) {
    const traducido = traducirErrorBase(error);
    console.error('Error al obtener conexion para venta:', error.message);
    return responderError(
      res,
      traducido ? traducido.status : 500,
      traducido ? traducido.message : 'Error interno del servidor'
    );
  }

  try {
    await conexion.beginTransaction();

    const [usuarios] = await conexion.query(
      'SELECT id FROM usuarios WHERE id = ? AND activo = 1',
      [usuarioIdNum]
    );

    if (usuarios.length === 0) {
      throw new ErrorVenta('El usuario de la venta no existe o está inactivo');
    }

    let total = 0;
    const detalle = [];

    for (const item of items) {
      const [filas] = await conexion.query(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = ? FOR UPDATE',
        [item.producto_id]
      );

      if (filas.length === 0) {
        throw new ErrorVenta(`El producto ${item.producto_id} no existe`);
      }

      const producto = filas[0];

      if (producto.stock < item.cantidad) {
        throw new ErrorVenta(`Stock insuficiente de ${producto.nombre}`);
      }

      total += Number(producto.precio) * item.cantidad;
      detalle.push({
        producto_id: producto.id,
        cantidad: item.cantidad,
        precio_unitario: producto.precio
      });
    }

    total = Math.round(total * 100) / 100;

    const [venta] = await conexion.query(
      'INSERT INTO ventas (fecha, total, usuario_id) VALUES (?, ?, ?)',
      [ahoraLima(), total, usuarioIdNum]
    );

    for (const d of detalle) {
      await conexion.query(
        'INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [venta.insertId, d.producto_id, d.cantidad, d.precio_unitario]
      );

      await conexion.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [d.cantidad, d.producto_id]
      );

      await conexion.query(
        "INSERT INTO movimientos (producto_id, tipo, cantidad) VALUES (?, 'salida', ?)",
        [d.producto_id, d.cantidad]
      );
    }

    await conexion.commit();

    return res.status(201).json({ venta_id: venta.insertId, total });

  } catch (error) {
    try {
      await conexion.rollback();
    } catch (errorRollback) {
      console.error('Error al revertir la transaccion:', errorRollback.message);
    }

    if (error instanceof ErrorVenta) {
      console.error('Venta rechazada:', error.message);
      return responderError(res, 400, error.message);
    }

    const traducido = traducirErrorBase(error);
    if (traducido) {
      console.error('Venta rechazada por la base:', error.message);
      return responderError(res, traducido.status, traducido.message);
    }

    console.error('Error al registrar venta:', error);
    return responderError(res, 500, 'Error interno del servidor');
  } finally {
    conexion.release();
  }
});

    const listar = async (req, res) => {
      const { desde, hasta, vendedor } = req.query;
      const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

      if ((desde && !formatoFecha.test(desde)) || (hasta && !formatoFecha.test(hasta))) {
        return res.status(400).json({ message: 'Las fechas deben tener formato YYYY-MM-DD' });
      }

      try {
        let sql = `
          SELECT v.id, v.fecha, v.total, v.usuario_id, u.nombre AS vendedor
          FROM ventas v
          LEFT JOIN usuarios u ON v.usuario_id = u.id
        `;
        const condiciones = [];
        const params = [];

        if (desde) {
          condiciones.push('DATE(v.fecha) >= ?');
          params.push(desde);
        }
        if (hasta) {
          condiciones.push('DATE(v.fecha) <= ?');
          params.push(hasta);
        }
        if (vendedor) {
          condiciones.push('u.nombre LIKE ?');
          params.push(`%${vendedor}%`);
        }

        if (condiciones.length > 0) {
          sql += ' WHERE ' + condiciones.join(' AND ');
        }

        sql += ' ORDER BY v.fecha DESC';

        const [rows] = await db.query(sql, params);
        res.json(rows);
      } catch (error) {
        console.error('Error en GET /api/ventas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
      }};


const detalle = asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);

  if (id === null) {
    return responderError(res, 400, 'El id de la venta no es válido');
  }

  try {
    const [ventas] = await db.query(
      'SELECT id, fecha, total, usuario_id FROM ventas WHERE id = ?',
      [id]
    );

    if (ventas.length === 0) {
      return responderError(res, 404, 'Venta no encontrada');
    }

    const [items] = await db.query(
      `SELECT p.nombre, dv.cantidad, dv.precio_unitario
       FROM detalle_venta dv
       INNER JOIN productos p ON dv.producto_id = p.id
       WHERE dv.venta_id = ?`,
      [id]
    );

    res.json({ ...ventas[0], detalle: items });
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/ventas/:id:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const hoy = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, fecha, total, usuario_id
       FROM ventas
       WHERE DATE(fecha) = ?
       ORDER BY fecha DESC`,
      [hoyLima()]
    );
    res.json(rows);
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/ventas/hoy:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});
const ventasSemana = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS dia, SUM(total) AS total
       FROM ventas
       WHERE DATE(fecha) >= ? - INTERVAL 6 DAY
       GROUP BY DATE_FORMAT(fecha, '%Y-%m-%d')`,
      [hoyLima()]
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


module.exports = { registrar, listar, detalle, hoy, ventasSemana };
