import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import MarcaLogo from "../components/MarcaLogo";

// Ancho mínimo de pantalla para usar la portada dividida (lg de Tailwind)
const ANCHO_PORTADA = 1024;

const BENEFICIOS = [
  {
    titulo: "Inventario al día",
    texto: "Cada producto con su stock y su mínimo a la vista.",
    icono: "M3 7l9-4 9 4-9 4-9-4z M3 7v10l9 4 9-4V7 M12 11v10",
  },
  {
    titulo: "Ventas en segundos",
    texto: "Busca, agrega al carrito y cobra sin vueltas.",
    icono: "M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6",
  },
  {
    titulo: "Alertas a tiempo",
    texto: "Entérate antes de quedarte sin un medicamento.",
    icono: "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z M10 21h4",
  },
  {
    titulo: "Todo en orden",
    texto: "Proveedores y categorías clasificados y a la mano.",
    icono: "M3 7h6l2 2h10v10H3z",
  },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});
  const [formularioActivo, setFormularioActivo] = useState(false);
  const [presentacionAbierta, setPresentacionAbierta] = useState(false);
  const navigate = useNavigate();
  const formularioEnUso = formularioActivo || loading || Boolean(error)

  const validar = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Escribe un correo válido, por ejemplo nombre@correo.com.";
    }
    if (!password) errs.password = "La contraseña es obligatoria.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errs = validar();
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Solo con mouse y en pantallas anchas: el verde se abre al pasar por su lado
  // y se cierra al ir hacia el lado blanco.
  const alMoverMouse = (e) => {
    if (e.pointerType !== "mouse" || window.innerWidth < ANCHO_PORTADA) return;
    const mitad = window.innerWidth / 2;
    if (presentacionAbierta) {
      if (e.clientX >= mitad) setPresentacionAbierta(false);
    } else {
      const limite = formularioEnUso ? 64 : mitad;
      if (e.clientX < limite) setPresentacionAbierta(true);
    }
  };

  const anchoVerde = presentacionAbierta
    ? "lg:w-full"
    : formularioEnUso
      ? "lg:w-16"
      : "lg:w-1/2";
  const margenFormulario = formularioEnUso ? "lg:pl-0" : "lg:pl-[50%]";
  const verdeCerrado = formularioEnUso && !presentacionAbierta;

  return (
    <main
      onPointerMove={alMoverMouse}
      onPointerLeave={() => setPresentacionAbierta(false)}
      className="relative flex min-h-screen flex-col overflow-hidden lg:block lg:h-screen"
    >
      {/* Lado blanco con el tapiz y el formulario */}
      <div
        className={`tapiz flex flex-1 items-center justify-center px-4 py-10 transition-[padding] duration-700 ease-in-out motion-reduce:transition-none lg:absolute lg:inset-0 lg:pr-0 ${margenFormulario}`}
      >
        <form
          noValidate
          onSubmit={handleSubmit}
          onFocus={() => setFormularioActivo(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setFormularioActivo(false);
            }
          }}
          className={`flex w-full max-w-sm flex-col gap-5 rounded-xl border-2 bg-white p-8 transition-colors duration-300 ${
            error ? "border-alerta" : "border-botica"
          }`}
        >
          <h1 className="text-2xl font-bold">Iniciar sesión</h1>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="etiqueta">
              Correo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrores((p) => ({ ...p, email: "" }));
              }}
              aria-invalid={Boolean(errores.email)}
              aria-describedby={errores.email ? "error-email" : undefined}
              className={`campo ${errores.email ? "campo-error" : ""}`}
            />
            {errores.email && (
              <p id="error-email" role="alert" className="texto-error">
                {errores.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="etiqueta">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrores((p) => ({ ...p, password: "" }));
              }}
              aria-invalid={Boolean(errores.password)}
              aria-describedby={errores.password ? "error-password" : undefined}
              className={`campo ${errores.password ? "campo-error" : ""}`}
            />
            {errores.password && (
              <p id="error-password" role="alert" className="texto-error">
                {errores.password}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="mensaje-error">
              {error}
            </p>
          )}

          <button
            type={error ? "button" : "submit"}
            disabled={loading}
            onClick={
              error
                ? (e) => {
                    e.preventDefault();
                    setError("");
                  }
                : undefined
            }
            className={`relative flex min-h-11 items-center justify-center overflow-hidden rounded-lg px-4 font-semibold text-white transition-colors duration-300 disabled:opacity-80 ${
              error
                ? "bg-alerta hover:bg-alerta/90"
                : "bg-botica hover:bg-botica-oscuro"
            }`}
          >
            {/* Línea normal, animada */}
            <svg
              viewBox="0 0 300 40"
              preserveAspectRatio="none"
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
                error ? "opacity-0" : "opacity-40"
              }`}
            >
              <path
                className="ecg-line"
                pathLength="100"
                d="M0 20 H25 L31 6 L39 34 L45 20 H125 L131 6 L139 34 L145 20 H225 L231 6 L239 34 L245 20 H300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Línea con fallo: un latido y luego plana */}
            <svg
              viewBox="0 0 300 40"
              preserveAspectRatio="none"
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
                error ? "opacity-40" : "opacity-0"
              }`}
            >
              <path
                d="M0 20 H25 L31 6 L39 34 L45 20 H300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Textos apilados, uno se funde con el otro */}
            <span className="relative z-10 grid">
              <span
                aria-hidden={!!error}
                className={`col-start-1 row-start-1 transition-opacity duration-300 ${
                  error ? "opacity-0" : "opacity-100"
                }`}
              >
                Ingresar
              </span>
              <span
                aria-hidden={!error}
                className={`col-start-1 row-start-1 transition-opacity duration-300 ${
                  error ? "opacity-100" : "opacity-0"
                }`}
              >
                Reintentar
              </span>
            </span>
          </button>
        </form>
      </div>

      {/* Lado verde: presentación. En pantallas angostas es una franja arriba */}
      <aside
        className={`relative order-first overflow-hidden bg-botica-oscuro text-white transition-[width] duration-700 ease-in-out motion-reduce:transition-none lg:absolute lg:inset-y-0 lg:left-0 lg:z-10 ${anchoVerde}`}
      >
        {/* Línea de latido de fondo, con ancho fijo para que no se estire */}
        <svg
          viewBox="0 0 1200 120"
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-[86%] hidden w-screen -translate-y-1/2 text-white opacity-10 lg:block"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M0 60 H300 L330 10 L370 110 L400 60 H700 L730 10 L770 110 L800 60 H1200" />
        </svg>

        {/* Nombre y logo: ancho fijo, no se mueven cuando el verde se abre o se cierra */}
        <div
          className={`relative flex flex-col items-center justify-center gap-5 px-6 py-8 text-center transition-opacity duration-500 motion-reduce:transition-none lg:absolute lg:inset-y-0 lg:left-0 lg:w-[50vw] lg:gap-6 lg:p-12 ${
            verdeCerrado ? "lg:opacity-0" : "lg:opacity-100"
          }`}
        >
          <MarcaLogo className="h-28 w-28 lg:h-44 lg:w-44" />
          <p className="text-4xl font-bold tracking-tight lg:text-6xl xl:text-7xl">
            Nova Salud
          </p>
          <p className="text-lg text-white/85 lg:text-2xl">
            Tu botica, ordenada y al día.
          </p>
        </div>

        {/* Logo pequeño que queda visible cuando el verde se contrae */}
        <MarcaLogo
          className={`absolute left-3 top-6 hidden h-10 w-10 transition-opacity duration-500 motion-reduce:transition-none lg:flex ${
            verdeCerrado ? "opacity-100 delay-300" : "opacity-0"
          }`}
        />

        {/* Lo que se revela cuando el verde ocupa toda la pantalla */}
        <div
          aria-hidden={!presentacionAbierta}
          className={`absolute inset-y-0 left-1/2 hidden w-1/2 flex-col justify-center gap-9 px-14 transition-opacity duration-500 motion-reduce:transition-none lg:flex ${
            presentacionAbierta ? "opacity-100 delay-500" : "opacity-0"
          }`}
        >
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/25">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={b.icono} />
                </svg>
              </span>
              <div>
                <h2 className="text-2xl font-semibold">{b.titulo}</h2>
                <p className="mt-1 max-w-sm text-white/80">{b.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}

export default Login;
