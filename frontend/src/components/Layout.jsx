import { NavLink, Outlet, useNavigate } from "react-router-dom";
import MarcaLogo from "./MarcaLogo";

const ENLACES = [
  { a: "/dashboard", texto: "Dashboard" },
  { a: "/inventario", texto: "Inventario" },
  { a: "/historial-inventario", texto: "Historial de inventario" },
  { a: "/pos", texto: "Punto de venta" },
  { a: "/categorias", texto: "Categorías" },
  { a: "/proveedores", texto: "Proveedores" },
  { a: "/alertas", texto: "Alertas de stock" },
];

const claseEnlace = ({ isActive }) =>
  `flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold ${
    isActive
      ? "bg-botica-suave text-botica-oscuro"
      : "text-tinta-suave hover:bg-papel hover:text-tinta"
  }`;

const Layout = () => {
  const navigate = useNavigate();
  const haySesion = Boolean(localStorage.getItem("token"));

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-linea bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-4 py-4 lg:px-5 lg:py-6">
          <MarcaLogo sobre="blanco" className="h-9 w-9" />
          <span className="text-xl font-bold text-botica-oscuro">Nova Salud</span>
        </div>

        <nav
          aria-label="Principal"
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-5"
        >
          {ENLACES.map((e) => (
            <NavLink key={e.a} to={e.a} className={claseEnlace}>
              {e.texto}
            </NavLink>
          ))}

          {haySesion ? (
            <button
              type="button"
              onClick={cerrarSesion}
              className="flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-tinta-suave hover:bg-papel hover:text-tinta lg:mt-auto"
            >
              Cerrar sesión
            </button>
          ) : (
            <NavLink
              to="/login"
              className={(estado) => `${claseEnlace(estado)} lg:mt-auto`}
            >
              Iniciar sesión
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;