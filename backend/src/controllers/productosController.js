const db = require('../db');
const { responderError, traducirErrorBase, asyncHandler } = require('../utils/errors');

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

// Convierte un valor del body a numero. Devuelve null si no es un numero valido.
const numero = (valor) => {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
};

// Id de la URL: tiene que ser un entero positivo.
const idValido = (valor) => {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const listar = asyncHandler(async (req, res) => {
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
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/productos:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

/**
 * Valida los campos de un producto. Devuelve el mensaje de error o null si
 * todo esta bien. Los decimales de precio se redondean a dos cifras.
 */
const validarProducto = (body, { parcial = false } = {}) => {
  const { nombre, precio, stock, stock_minimo, categoria_id, proveedor_id } = body || {};

  if (!parcial || nombre !== undefined) {
    if (!texto(nombre)) {
      return 'El nombre del producto es requerido';
    }
    if (texto(nombre).length > 100) {
      return 'El nombre del producto no puede superar los 100 caracteres';
    }
  }

  if (!parcial || precio !== undefined) {
    const p = numero(precio);
    if (p === null) {
      return 'El precio debe ser un número';
    }
    if (p < 0) {
      return 'El precio no puede ser negativo';
    }
  }

  if (!parcial || stock !== undefined) {
    const s = numero(stock);
    if (s === null || !Number.isInteger(s)) {
      return 'El stock debe ser un número entero';
    }
    if (s < 0) {
      return 'El stock no puede ser negativo';
    }
  }

  if (!parcial || stock_minimo !== undefined) {
    const sm = numero(stock_minimo);
    if (sm === null || !Number.isInteger(sm)) {
      return 'El stock mínimo debe ser un número entero';
    }
    if (sm < 0) {
      return 'El stock mínimo no puede ser negativo';
    }
  }

  if (categoria_id !== undefined && categoria_id !== null && categoria_id !== '') {
    if (idValido(categoria_id) === null) {
      return 'La categoría enviada no es válida';
    }
  }

  if (proveedor_id !== undefined && proveedor_id !== null && proveedor_id !== '') {
    if (idValido(proveedor_id) === null) {
      return 'El proveedor enviado no es válido';
    }
  }

  return null;
};

const actualizar = asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);
  const { nombre, precio, stock, stock_minimo, categoria_id, proveedor_id } = req.body || {};

  if (id === null) {
    return responderError(res, 400, 'El id del producto no es válido');
  }

  if (!nombre || texto(nombre) === '' || precio === undefined || stock === undefined || stock_minimo === undefined) {
    return responderError(res, 400, 'Faltan datos del producto');
  }

  const errorValidacion = validarProducto(req.body);
  if (errorValidacion) {
    return responderError(res, 400, errorValidacion);
  }

  try {
    const [existe] = await db.query('SELECT id FROM productos WHERE id = ?', [id]);

    if (existe.length === 0) {
      return responderError(res, 404, 'Producto no encontrado');
    }

    await db.query(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ?, stock_minimo = ?, categoria_id = ?, proveedor_id = ? WHERE id = ?',
      [
        texto(nombre),
        Math.round(numero(precio) * 100) / 100,
        numero(stock),
        numero(stock_minimo),
        categoria_id ? idValido(categoria_id) : null,
        proveedor_id ? idValido(proveedor_id) : null,
        id
      ]
    );

    const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
    res.status(200).json(rows[0]);
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en PUT /api/productos/:id:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const crear = asyncHandler(async (req, res) => {
  const { nombre, precio, stock, stock_minimo } = req.body || {};

  if (!texto(nombre) || precio === undefined || stock === undefined || stock_minimo === undefined) {
    return responderError(res, 400, 'Faltan campos obligatorios');
  }

  const errorValidacion = validarProducto(req.body);
  if (errorValidacion) {
    return responderError(res, 400, errorValidacion);
  }

  const categoria_id = req.body.categoria_id ? idValido(req.body.categoria_id) : null;
  const proveedor_id = req.body.proveedor_id ? idValido(req.body.proveedor_id) : null;

  try {
    const [resultado] = await db.query(
      `INSERT INTO productos
       (nombre, precio, stock, stock_minimo, categoria_id, proveedor_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        texto(nombre),
        Math.round(numero(precio) * 100) / 100,
        numero(stock),
        numero(stock_minimo),
        categoria_id,
        proveedor_id
      ]
    );

    res.status(201).json({
      id: resultado.insertId,
      nombre: texto(nombre),
      precio: Math.round(numero(precio) * 100) / 100,
      stock: numero(stock),
      stock_minimo: numero(stock_minimo),
      categoria_id,
      proveedor_id
    });
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en POST /api/productos:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const eliminar = asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);

  if (id === null) {
    return responderError(res, 400, 'El id del producto no es válido');
  }

  try {
    const [existe] = await db.query('SELECT id FROM productos WHERE id = ?', [id]);

    if (existe.length === 0) {
      return responderError(res, 404, 'Producto no encontrado');
    }

    await db.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return responderError(res, 400, 'El producto tiene ventas registradas y no se puede eliminar');
    }

    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }

    console.error('Error en DELETE /api/productos/:id:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const buscar = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (typeof q !== 'string' || q.trim() === '') {
    return responderError(res, 400, 'Falta el término de búsqueda');
  }

  const termino = q.trim();

  if (termino.length > 100) {
    return responderError(res, 400, 'El término de búsqueda no puede superar los 100 caracteres');
  }

  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE nombre LIKE ?', [`%${termino}%`]);
    res.json(rows);
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/productos/buscar:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

module.exports = { listar, actualizar, crear, eliminar, buscar };
