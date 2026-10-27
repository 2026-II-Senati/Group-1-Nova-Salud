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

app.get("/api/productos", async (_request, response) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id, 
        p.nombre, 
        p.precio, 
        p.stock, 
        p.stock_minimo, 
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `);
    response.json(rows);
  } catch (error) {
    console.error("Error al obtener productos de MySQL:", error);
    response.status(500).json({ error: error.message });
  }
});

app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Nova Salud API activa en http://localhost:${port}`);
});