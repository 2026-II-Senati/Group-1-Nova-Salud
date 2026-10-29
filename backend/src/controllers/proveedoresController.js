const db = require('../db');

const listar = async (req, res) => {
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

module.exports = { listar, crear };