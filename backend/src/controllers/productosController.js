const db = require('../db');

const listar = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.nombre, p.precio, p.stock, p.stock_minimo,
              p.categoria_id, c.nombre AS categoria,
              p.proveedor_id
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       ORDER BY p.id`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


const actualizar = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock, stock_minimo, categoria_id, proveedor_id } = req.body;

  if (!nombre || !nombre.trim() || precio === undefined || stock === undefined || stock_minimo === undefined) {
    return res.status(400).json({ message: 'Faltan datos del producto' });
  }

  try {
    const [existe] = await db.query('SELECT id FROM productos WHERE id = ?', [id]);

    if (existe.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await db.query(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ?, stock_minimo = ?, categoria_id = ?, proveedor_id = ? WHERE id = ?',
      [nombre.trim(), precio, stock, stock_minimo, categoria_id || null, proveedor_id || null, id]
    );

    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error en PUT /api/productos/:id:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
const crear = async (req, res) => {
  const { nombre, precio, stock, stock_minimo, categoria_id, proveedor_id } = req.body;

  if (!nombre || precio === undefined || stock === undefined || stock_minimo === undefined) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    const [resultado] = await db.query(
      `INSERT INTO productos
       (nombre, precio, stock, stock_minimo, categoria_id, proveedor_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, precio, stock, stock_minimo, categoria_id, proveedor_id]
    );

    res.status(201).json({
      id: resultado.insertId,
      nombre, precio, stock, stock_minimo, categoria_id, proveedor_id
    });
  } catch (error) {
    console.error('Error en POST /api/productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;

  try {
    const [existe] = await db.query('SELECT id FROM productos WHERE id = ?', [id]);

    if (existe.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await db.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return res.status(400).json({ message: 'El producto tiene ventas registradas' });
    }

    console.error('Error en DELETE /api/productos/:id:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const buscar = async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({ message: 'Falta el termino de busqueda' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE nombre LIKE ?', [`%${q.trim()}%`]);
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/productos/buscar:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { listar, actualizar, crear, eliminar, buscar };