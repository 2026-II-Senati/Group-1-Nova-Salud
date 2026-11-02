import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Categorias from "./pages/Categorias";
import Proveedores from "./pages/Proveedores";
import Alertas from "./pages/Alertas";
import Pos from "./pages/Pos";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route path="/login" element={<Login />} />

      {/* Pantallas con barra lateral */}
      <Route element={<Layout />}>
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/pos" element={<Pos />} />

        {/* Rutas privadas envueltas con ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      {/* Cualquier otra ruta redirige a dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
