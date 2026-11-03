import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Categorias from "./pages/Categorias";
import Proveedores from "./pages/Proveedores";
import Alertas from "./pages/Alertas";
import Pos from "./pages/Pos";
import { HistorialInventario } from "./pages/HistorialInventario";
import Layout from "./components/Layout";
import Usuarios from "./pages/Usuarios";
import RutaAdmin from "./components/RutaAdmin";

function App() {
  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route path="/login" element={<Login />} />

      {/* Pantallas privadas: requieren sesión iniciada */}
      <Route element={<ProtectedRoute />}>
        {/* Pantallas con barra lateral */}
        <Route element={<Layout />}>
          {/* Solo administradores */}
          <Route element={<RutaAdmin />}>
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/historial-inventario" element={<HistorialInventario />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/pos" element={<Pos />} />
        </Route>
      </Route>

      {/* Cualquier otra ruta redirige a dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
