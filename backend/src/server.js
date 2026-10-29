const cors = require('cors');
require("dotenv").config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const pool = require("./db");

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

    // Validación de campos obligatorios -> 400 Bad Request
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

app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Nova Salud API activa en http://localhost:${port}`);
});