const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = header.slice(7).trim();

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET || 'secreto_nova_salud_2026');
    req.usuario = datos;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o vencido' });
  }
};

module.exports = verifyToken;
