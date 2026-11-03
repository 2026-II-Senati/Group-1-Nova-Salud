const jwt = require('jsonwebtoken');
const { responderError } = require('../utils/errors');

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return responderError(res, 401, 'Token no proporcionado');
  }

  const token = header.slice(7).trim();

  if (!token) {
    return responderError(res, 401, 'Token no proporcionado');
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET || 'secreto_nova_salud_2026');
    req.usuario = datos;
    return next();
  } catch (error) {
    return responderError(res, 401, 'Token inválido o vencido');
  }
};

module.exports = verifyToken;
