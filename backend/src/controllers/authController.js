const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    const [existentes] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existentes.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, 2]
    );

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: result.insertId,
        nombre,
        email
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'El correo y la contraseña son requeridos' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const usuario = rows[0];

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
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
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
  const register = async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' });
  }

  try {
    const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);

    if (existe.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    const [resultado] = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
      [nombre, email, hash, rol_id || 2]
    );

    return res.status(201).json({
      id: resultado.insertId,
      nombre,
      email,
      rol_id: rol_id || 2
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

};
module.exports = { login, register };

