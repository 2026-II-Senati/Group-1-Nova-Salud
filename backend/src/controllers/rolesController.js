const db = require('../db');
const { responderError, traducirErrorBase, asyncHandler } = require('../utils/errors');

const listar = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre FROM roles');
    res.json(rows);
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/roles:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

module.exports = { listar };
