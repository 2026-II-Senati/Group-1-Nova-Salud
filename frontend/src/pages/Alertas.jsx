import { useEffect, useState } from "react";

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/alertas")
      .then(async (res) => {
        if (!res.ok) throw new Error("Error del servidor");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Respuesta inválida");
        setAlertas(data);
      })
      .catch((err) => {
        console.error("Error al cargar las alertas:", err);
        setError("No se pudo conectar con el servidor.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-slate-600">Cargando alertas...</p>;
  if (error)
    return (
      <p role="alert" className="p-6 text-red-700">
        Error: {error}
      </p>
    );

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 sm:p-8">
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">Alertas de stock</h1>

      {alertas.length === 0 ? (
        <p
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-6 text-center text-lg font-semibold text-green-800"
        >
          Todo en orden
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Producto
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Stock actual
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Stock mínimo
                </th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-slate-200 bg-red-50 font-semibold text-red-800"
                >
                  <td className="px-4 py-3">{a.nombre}</td>
                  <td className="px-4 py-3">{a.stock}</td>
                  <td className="px-4 py-3">{a.stock_minimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default Alertas;
