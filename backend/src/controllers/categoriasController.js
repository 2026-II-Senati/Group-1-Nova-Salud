const db = require('../db');
const { responderError, traducirErrorBase, asyncHandler } = require('../utils/errors');

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

const listar = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre FROM categorias');
    res.json(rows);
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/categorias:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const crear = asyncHandler(async (req, res) => {
  const { nombre } = req.body || {};

  if (!texto(nombre)) {
    return responderError(res, 400, 'El nombre es requerido');
  }

  try {
    const [existe] = await db.query(
      'SELECT id FROM categorias WHERE nombre = ?',
      [texto(nombre)]
    );

    if (existe.length > 0) {
      return responderError(res, 400, 'La categoría ya existe');
    }

    const [resultado] = await db.query(
      'INSERT INTO categorias (nombre) VALUES (?)',
      [texto(nombre)]
    );

    res.status(201).json({ id: resultado.insertId, nombre: texto(nombre) });
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en POST /api/categorias:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const editar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body || {};

  if (!texto(nombre)) {
    return responderError(res, 400, 'El nombre es requerido');
  }

  try {
    const [resultado] = await db.query(
      'UPDATE categorias SET nombre = ? WHERE id = ?',
      [texto(nombre), id]
    );

    if (resultado.affectedRows === 0) {
      return responderError(res, 404, 'Categoría no encontrada');
    }

    res.json({ id: Number(id), nombre: texto(nombre) });
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en PUT /api/categorias:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

module.exports = { listar, crear, editar };
