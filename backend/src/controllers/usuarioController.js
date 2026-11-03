const db = require('../db');
const { responderError, traducirErrorBase, asyncHandler } = require('../utils/errors');

const idValido = (valor) => {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const cambiarEstado = asyncHandler(async (req, res) => {
  const id = idValido(req.params.id);
  const { activo } = req.body || {};

  if (req.usuario.rol_id !== 1) {
    return responderError(res, 403, 'Solo un administrador puede cambiar el estado');
  }

  if (id === null) {
    return responderError(res, 400, 'El id del usuario no es válido');
  }

  if (typeof activo !== 'boolean') {
    return responderError(res, 400, 'activo debe ser true o false');
  }

  try {
    const [resultado] = await db.query(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [activo, id]
    );

    if (resultado.affectedRows === 0) {
      return responderError(res, 404, 'Usuario no encontrado');
    }

    res.json({ id, activo });
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en PUT /api/usuarios/:id/estado:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const listar = asyncHandler(async (req, res) => {
  if (req.usuario.rol_id !== 1) {
    return responderError(res, 403, 'Solo un administrador puede ver los usuarios');
  }

  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, rol_id, activo FROM usuarios ORDER BY id'
    );
    res.json(rows);
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/usuarios:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

module.exports = { cambiarEstado, listar };
