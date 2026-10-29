require("dotenv").config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/productosRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const proveedoresRoutes = require('./routes/proveedoresRoutes');

const pool = require("./db");
const cors = require('cors');

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", async (_request, response) => {
  try {
    await pool.query("SELECT 1");
    response.json({ database: "Conectada exitosamente" });
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    response.status(503).json({ database: "No se pudo conectar" });
  }
});

app.get("/api/productos", async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        p.id, 
        p.nombre, 
        p.precio, 
        p.stock, 
        p.stock_minimo, 
        c.nombre AS categoria,
        p.categoria_id,
        p.proveedor_id
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `;
    let params = [];

    if (search) {
      query += ` WHERE p.nombre LIKE ?`;
      params.push(`%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error en GET /api/productos:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/productos", async (req, res) => {
  try {
    const { nombre, precio, stock, stock_minimo, categoria_id, proveedor_id } = req.body;

    if (!nombre || precio == null || stock == null || stock_minimo == null) {
      return res.status(400).json({ message: "Faltan datos obligatorios en el body" });
    }

    const [result] = await pool.query(
      `INSERT INTO productos (nombre, precio, stock, stock_minimo, categoria_id, proveedor_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, precio, stock, stock_minimo, categoria_id || null, proveedor_id || null]
    );

    res.status(201).json({ id: result.insertId, message: "Producto creado exitosamente" });
  } catch (error) {
    console.error("Error en POST /api/productos:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock, stock_minimo, categoria_id, proveedor_id } = req.body;

    const [exist] = await pool.query("SELECT id FROM productos WHERE id = ?", [id]);
    if (exist.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (!nombre || precio == null || stock == null || stock_minimo == null) {
      return res.status(400).json({ message: "Datos incompletos para actualizar" });
    }

    await pool.query(
      `UPDATE productos SET nombre = ?, precio = ?, stock = ?, stock_minimo = ?, categoria_id = ?, proveedor_id = ? WHERE id = ?`,
      [nombre, precio, stock, stock_minimo, categoria_id || null, proveedor_id || null, id]
    );

    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error en PUT /api/productos:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [exist] = await pool.query("SELECT id FROM productos WHERE id = ?", [id]);
    if (exist.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const [ventas] = await pool.query("SELECT id FROM detalle_venta WHERE producto_id = ? LIMIT 1", [id]);
    if (ventas.length > 0) {
      return res.status(400).json({ message: "No se puede eliminar un producto asociado a ventas existentes" });
    }

    await pool.query("DELETE FROM productos WHERE id = ?", [id]);
    res.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error en DELETE /api/productos:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/proveedores", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM proveedores");
    res.json(rows);
  } catch (error) {
    console.error("Error en GET /api/proveedores:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/proveedores", async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre del proveedor es obligatorio" });
    }

    const [result] = await pool.query(
      `INSERT INTO proveedores (nombre) VALUES (?)`,
      [nombre.trim()]
    );

    res.status(201).json({ id: result.insertId, message: "Proveedor creado exitosamente" });
  } catch (error) {
    console.error("Error en POST /api/proveedores:", error);
    res.status(500).json({ 
      error: error.message, 
      message: `Error en la base de datos: ${error.sqlMessage || error.message}` 
    });
  }
});

app.delete("/api/proveedores/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [exist] = await pool.query("SELECT id FROM proveedores WHERE id = ?", [id]);
    if (exist.length === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    const [productos] = await pool.query("SELECT id FROM productos WHERE proveedor_id = ? LIMIT 1", [id]);
    if (productos.length > 0) {
      return res.status(400).json({ message: "No se puede eliminar un proveedor con productos asociados" });
    }

    await pool.query("DELETE FROM proveedores WHERE id = ?", [id]);
    res.json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    console.error("Error en DELETE /api/proveedores:", error);
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api', usuarioRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/proveedores', proveedoresRoutes);

app.listen(port, () => {
  console.log(`Nova Salud API activa en http://localhost:${port}`);
});
