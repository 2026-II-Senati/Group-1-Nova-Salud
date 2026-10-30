const db = require('../db');

const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  if (req.usuario.rol_id !== 1) {
    return res.status(403).json({ message: 'Solo un administrador puede cambiar el estado' });
  }

  if (typeof activo !== 'boolean') {
    return res.status(400).json({ message: 'activo debe ser true o false' });
  }

  try {
    const [resultado] = await db.query(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [activo, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ id: Number(id), activo });
  } catch (error) {
    console.error('Error en PUT /api/usuarios/:id/estado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { cambiarEstado };
