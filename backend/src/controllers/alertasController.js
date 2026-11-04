const db = require('../db');
const { responderError, traducirErrorBase, asyncHandler } = require('../utils/errors');

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

const listar = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, stock, stock_minimo
       FROM productos
       WHERE stock < stock_minimo
       ORDER BY stock ASC`
    );
    res.json(rows);
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en GET /api/alertas:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

module.exports = { listar };
