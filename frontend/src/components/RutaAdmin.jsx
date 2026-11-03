import { Navigate, Outlet } from "react-router-dom";
import { esAdmin } from "../services/sesion";

// Deja pasar solo a administradores. Sin sesión va al login; vendedor al dashboard.
const RutaAdmin = () => {
  if (!localStorage.getItem("token")) return <Navigate to="/login" replace />;
  if (!esAdmin()) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default RutaAdmin;