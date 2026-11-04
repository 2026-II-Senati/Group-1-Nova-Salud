const db = require('../db');
const { responderError, traducirErrorBase, asyncHandler } = require('../utils/errors');

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

const idValido = (valor) => {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const listar = asyncHandler(async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre FROM proveedores');
    res.json(rows);
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/proveedores:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const crear = asyncHandler(async (req, res) => {
  const { nombre } = req.body || {};

  if (!texto(nombre)) {
    return responderError(res, 400, 'El nombre es requerido');
  }

  if (texto(nombre).length > 100) {
    return responderError(res, 400, 'El nombre no puede superar los 100 caracteres');
  }

  try {
    const [resultado] = await db.query(
      'INSERT INTO proveedores (nombre) VALUES (?)',
      [texto(nombre)]
    );

    res.status(201).json({ id: resultado.insertId, nombre: texto(nombre) });
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en POST /api/proveedores:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const eliminar = asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);

  if (id === null) {
    return responderError(res, 400, 'El id del proveedor no es válido');
  }

  try {
    const [existe] = await db.query(
      'SELECT id FROM proveedores WHERE id = ?',
      [id]
    );

    if (existe.length === 0) {
      return responderError(res, 404, 'Proveedor no encontrado');
    }

    await db.query('DELETE FROM proveedores WHERE id = ?', [id]);
    res.status(200).json({ message: 'Proveedor eliminado' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return responderError(res, 400, 'El proveedor tiene productos asociados y no se puede eliminar');
    }

    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }

    console.error('Error en DELETE /api/proveedores/:id:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

module.exports = { listar, crear, eliminar };
