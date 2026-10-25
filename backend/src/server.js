require("dotenv").config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/productosRoutes');
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
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes); 
app.listen(port, () => {
  console.log(`Nova Salud API activa en http://localhost:${port}`);
});