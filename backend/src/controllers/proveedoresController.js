const db = require('../db');

const listar = async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre FROM proveedores');
    res.json(rows);
  } catch (error) {
    console.error('Error en GET /api/proveedores:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const crear = async (req, res) => {
  const { nombre } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ message: 'El nombre es requerido' });
  }

  try {
    const [resultado] = await db.query(
      'INSERT INTO proveedores (nombre) VALUES (?)',
      [nombre.trim()]
    );

    res.status(201).json({ id: resultado.insertId, nombre: nombre.trim() });
  } catch (error) {
    console.error('Error en POST /api/proveedores:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const eliminar = async (req, res) => {
  const { id } = req.params;

  try {
    const [existe] = await db.query(
      'SELECT id FROM proveedores WHERE id = ?',
      [id]
    );

    if (existe.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    await db.query('DELETE FROM proveedores WHERE id = ?', [id]);
    res.status(200).json({ message: 'Proveedor eliminado' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return res.status(400).json({
        message: 'El proveedor tiene productos asociados'
      });
    }

    console.error('Error en DELETE /api/proveedores/:id:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { listar, crear, eliminar };
