import { Routes, Route } from "react-router-dom";
import Inventario from "./pages/Inventario";
import Proveedores from "./pages/Proveedores";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <h1 className="p-8 text-3xl font-bold text-emerald-700">
            Nova Salud
          </h1>
        }
      />
      <Route path="/inventario" element={<Inventario />} />
      <Route path="/proveedores" element={<Proveedores />} />
    </Routes>
  );
}

export default App;