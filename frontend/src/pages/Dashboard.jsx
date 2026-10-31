import { useEffect, useState } from "react";

const TARJETAS = [
  { clave: "ventas_hoy", titulo: "Ventas de hoy", estilo: "text-teal-700" },
  { clave: "total_productos", titulo: "Total de productos", estilo: "text-slate-900" },
  {
    clave: "productos_bajo_stock",
    titulo: "Productos en alerta",
    estilo: "text-red-700",
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

  if (loading) return <p className="p-6 text-slate-600">Cargando dashboard...</p>;
  if (error)
    return (
      <p role="alert" className="p-6 text-red-700">
        Error: {error}
      </p>
    );

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 sm:p-8">
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {TARJETAS.map((t) => (
          <section
            key={t.clave}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="text-sm font-semibold text-slate-600">{t.titulo}</h2>
            <p className={`mt-2 text-4xl font-bold ${t.estilo}`}>
              {metricas?.[t.clave] ?? "-"}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
};

export default Dashboard;
