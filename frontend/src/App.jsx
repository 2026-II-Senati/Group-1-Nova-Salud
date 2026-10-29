import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Inventario from "./pages/Inventario";
import Proveedores from "./pages/Proveedores";
import ProtectedRoute from "./components/ProtectedRoute";

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

      {/* Vistas principales */}
      <Route path="/inventario" element={<Inventario />} />
      <Route path="/proveedores" element={<Proveedores />} />

      {/* Rutas privadas envueltas con ProtectedRoute */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;