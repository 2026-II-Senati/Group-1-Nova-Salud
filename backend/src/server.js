require("dotenv").config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/productosRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const proveedoresRoutes = require('./routes/proveedoresRoutes');
const alertasRoutes = require('./routes/alertasRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const movimientosRoutes = require('./routes/movimientosRoutes');

const pool = require("./db");
const { errores } = require("./utils/errors");
const cors = require('cors');

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

// Un body con JSON mal formado lo detecta express.json() y lo marca con
// error.type = 'entity.parse.failed'. Se captura aqui para responder 400 con el
// formato comun en vez de dejar que llegue al manejador de 500.
app.use(express.json());
app.use((error, _request, response, next) => {
  if (error && (error.type === 'entity.parse.failed' || (error instanceof SyntaxError && 'body' in error))) {
    return errores.BAD_JSON(_request, response);
  }
  return next(error);
});

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
app.use('/api/roles', rolesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api', usuarioRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/movimientos', movimientosRoutes);

// Respuestas de error con el formato comun { "message": "..." }
app.use(errores.RUTA_NO_ENCONTRADA);
app.use(errores.INTERNO);

app.listen(port, () => {
  console.log(`Nova Salud API activa en http://localhost:${port}`);
});
