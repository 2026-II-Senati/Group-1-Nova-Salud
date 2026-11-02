import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Categorias from './pages/Categorias';
import Proveedores from './pages/Proveedores';
import Alertas from './pages/Alertas';
import Pos from './pages/Pos';
import { HistorialInventario } from './pages/HistorialInventario';

function App() {
  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route path="/login" element={<Login />} />

      {/* Vista de inventario (T25) */}
      <Route path="/inventario" element={<Inventario />} />

      {/* Vista de historial de inventario (T58) */}
      <Route path="/historial-inventario" element={<HistorialInventario />} />

      {/* Vista de categorías (T35) */}
      <Route path="/categorias" element={<Categorias />} />

      {/* Vista de proveedores (T35) */}
      <Route path="/proveedores" element={<Proveedores />} />

      {/* Vista de alertas de stock (T52) */}
      <Route path="/alertas" element={<Alertas />} />

      {/* Vista del punto de venta (T41) */}
      <Route path="/pos" element={<Pos />} />

      {/* Rutas privadas envueltas con ProtectedRoute */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Cualquier otra ruta redirige a dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;