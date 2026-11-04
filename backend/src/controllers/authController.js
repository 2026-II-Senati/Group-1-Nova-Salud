const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { responderError, traducirErrorBase, asyncHandler } = require('../utils/errors');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

const register = asyncHandler(async (req, res) => {
  const { nombre, email, password } = req.body || {};

  if (!texto(nombre) || !texto(email) || typeof password !== 'string' || password === '') {
    return responderError(res, 400, 'Todos los campos son requeridos');
  }

  if (!EMAIL_REGEX.test(texto(email))) {
    return responderError(res, 400, 'El correo no tiene un formato válido');
  }

  if (password.length < 6) {
    return responderError(res, 400, 'La contraseña debe tener al menos 6 caracteres');
  }

  try {
    const [existentes] = await db.query('SELECT id FROM usuarios WHERE email = ?', [texto(email)]);
    if (existentes.length > 0) {
      return responderError(res, 400, 'El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
      [texto(nombre), texto(email), hashedPassword, 2]
    );

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: result.insertId,
        nombre: texto(nombre),
        email: texto(email)
      }
    });
  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en registro:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!texto(email) || typeof password !== 'string' || password === '') {
    return responderError(res, 400, 'El correo y la contraseña son requeridos');
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [texto(email)]);

    if (rows.length === 0) {
      return responderError(res, 401, 'Credenciales inválidas');
    }

    const usuario = rows[0];

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return responderError(res, 401, 'Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol_id: usuario.rol_id
      },
      process.env.JWT_SECRET || 'secreto_nova_salud_2026',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol_id: usuario.rol_id
      }
    });

  } catch (error) {
    const traducido = traducirErrorBase(error);
    if (traducido) {
      return responderError(res, traducido.status, traducido.message);
    }
    console.error('Error en login:', error);
    return responderError(res, 500, 'Error interno del servidor');
  }
});

module.exports = { login, register };
