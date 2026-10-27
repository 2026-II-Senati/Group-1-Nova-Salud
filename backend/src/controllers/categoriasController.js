const db = require('../db');

const listar = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre FROM categorias');
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/categorias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const crear = async (req, res) => {
  const { nombre } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  try {
    const [existe] = await db.query(
      'SELECT id FROM categorias WHERE nombre = ?',
      [nombre.trim()]
    );

    if (existe.length > 0) {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }

    const [resultado] = await db.query(
      'INSERT INTO categorias (nombre) VALUES (?)',
      [nombre.trim()]
    );

    res.status(201).json({ id: resultado.insertId, nombre: nombre.trim() });
  } catch (error) {
    console.error('Error en POST /api/categorias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
const editar = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  try {
    const [resultado] = await db.query(
      'UPDATE categorias SET nombre = ? WHERE id = ?',
      [nombre.trim(), id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json({ id: Number(id), nombre: nombre.trim() });
  } catch (error) {
    console.error('Error en PUT /api/categorias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { listar , crear, editar };
