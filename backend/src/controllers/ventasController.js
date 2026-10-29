const db = require('../db');

const registrar = async (req, res) => {
  const { usuario_id, productos } = req.body;

  if (!usuario_id || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ message: 'usuario_id y productos son requeridos' });
  }

  for (const item of productos) {
    if (!item.producto_id || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      return res.status(400).json({
        message: 'Cada producto debe tener producto_id y una cantidad entera mayor a cero'
      });
    }
  }

  const agrupados = {};
  for (const item of productos) {
    agrupados[item.producto_id] = (agrupados[item.producto_id] || 0) + item.cantidad;
  }

  const items = Object.entries(agrupados).map(([id, cantidad]) => ({
    producto_id: Number(id),
    cantidad
  }));

  const conexion = await db.getConnection();

  try {
    await conexion.beginTransaction();

    let total = 0;
    const detalle = [];

    for (const item of items) {
      const [filas] = await conexion.query(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = ? FOR UPDATE',
        [item.producto_id]
      );

      if (filas.length === 0) {
        throw new Error(`El producto ${item.producto_id} no existe`);
      }

      const producto = filas[0];

      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente de ${producto.nombre}`);
      }

      total += Number(producto.precio) * item.cantidad;
      detalle.push({
        producto_id: producto.id,
        cantidad: item.cantidad,
        precio_unitario: producto.precio
      });
    }

    const [venta] = await conexion.query(
      'INSERT INTO ventas (total, usuario_id) VALUES (?, ?)',
      [total, usuario_id]
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

    res.status(201).json({ venta_id: venta.insertId, total });

  } catch (error) {
    await conexion.rollback();
    console.error('Error al registrar venta:', error.message);
    res.status(400).json({ message: error.message });
  } finally {
    conexion.release();
  }
};
const listar = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, fecha, total, usuario_id FROM ventas ORDER BY fecha DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/ventas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { registrar, listar };
