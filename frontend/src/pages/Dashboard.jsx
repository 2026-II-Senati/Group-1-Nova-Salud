import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GraficoVentas from "../components/GraficoVentas";

const TARJETAS = [
  { clave: "ventas_hoy", titulo: "Ventas de hoy" },
  { clave: "total_productos", titulo: "Productos registrados" },
  {
    clave: "productos_bajo_stock",
    titulo: "Productos con stock bajo",
    alerta: true,
  },
];

const Dashboard = () => {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/dashboard/metricas")
      .then(async (res) => {
        if (!res.ok) throw new Error("Error del servidor");
        setMetricas(await res.json());
      })
      .catch((err) => {
        console.error("Error al cargar las métricas:", err);
        setError("No se pudo conectar con el servidor.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="pagina text-tinta-suave">Cargando dashboard...</p>;
  if (error)
    return (
      <main className="pagina">
        <p role="alert" className="mensaje-error">
          Error: {error}
        </p>
      </main>
    );

  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {TARJETAS.map((t) => {
          const valor = metricas?.[t.clave];
          const enAlerta = t.alerta && valor > 0;
          const clase = `panel p-5 ${
            enAlerta ? "border-alerta/40 bg-alerta-suave" : ""
          }`;
          const interior = (
            <>
              <h2 className="text-sm font-semibold text-tinta-suave">{t.titulo}</h2>
              <p
                className={`mt-2 text-4xl font-bold tabular-nums ${
                  enAlerta ? "text-alerta" : "text-tinta"
                }`}
              >
                {valor ?? "-"}
              </p>
              {enAlerta && (
                <p className="mt-1 text-sm font-semibold text-alerta">Ver cuáles</p>
              )}
            </>
          );

          return enAlerta ? (
            <Link
              key={t.clave}
              to="/alertas"
              className={`${clase} block hover:border-alerta`}
            >
              {interior}
            </Link>
          ) : (
            <section key={t.clave} className={clase}>
              {interior}
            </section>
          );
        })}
      </div>

      <div className="mt-4">
        <GraficoVentas />
      </div>
    </main>
  );
};

export default Dashboard;