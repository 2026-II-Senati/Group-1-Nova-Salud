import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Inventario from './pages/Inventario';

function Dashboard() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Panel de Administración (Ruta Privada Protegida)</h2>
      <p>Bienvenido al sistema Nova Salud.</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route path="/login" element={<Login />} />

      {/* Vista de inventario (T25) */}
      <Route path="/inventario" element={<Inventario />} />

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