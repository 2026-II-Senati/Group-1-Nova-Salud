import React, { useEffect, useState } from "react";

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3000/api/productos"),
      fetch("http://localhost:3000/api/categorias"),
    ])
      .then(async ([resProd, resCat]) => {
        if (!resProd.ok || !resCat.ok) {
          throw new Error("Error del servidor");
        }
        const prods = await resProd.json();
        const cats = await resCat.json();
        if (!Array.isArray(prods)) {
          setError("El backend no devolvió una lista válida.");
          return;
        }
        setProductos(prods);
        setCategorias(Array.isArray(cats) ? cats : []);
      })
      .catch((err) => {
        console.error("Error al cargar el inventario:", err);
        setError("No se pudo conectar con el servidor.");
      })
      .finally(() => setLoading(false));
  }, []);

  const nombreCategoria = (id) =>
    categorias.find((c) => c.id === id)?.nombre || "-";

  const bajos = productos.filter((p) => p.stock < p.stock_minimo);
  if (loading)
    return <p className="p-6 text-slate-600">Cargando inventario...</p>;
  if (error)
    return (
      <p role="alert" className="p-6 text-red-700">
        Error: {error}
      </p>
    );

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">Inventario</h1>

        {bajos.length > 0 && (
          <div className="flex h-8 max-w-8 items-center overflow-hidden whitespace-nowrap rounded-full bg-amber-300 shadow transition-[max-width] duration-500 ease-in-out focus-within:max-w-3xl hover:max-w-3xl">
            <button
              type="button"
              aria-label={`${bajos.length} productos con stock bajo`}
              className="flex h-8 w-8 shrink-0 items-center justify-center text-sm font-bold text-red-700"
            >
              {bajos.length}
            </button>

            <div className="flex items-center gap-3 pr-4 text-sm text-amber-900">
              <span className="font-semibold">Stock bajo:</span>
              {bajos.map((p) => (
                <span key={p.id}>
                  {p.nombre}{" "}
                  <b className="text-red-700">
                    ({p.stock}/{p.stock_minimo})
                  </b>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Producto
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Categoría
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Precio
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Stock mínimo
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod) => {
              const bajoStock = prod.stock < prod.stock_minimo;
              return (
                <tr
                  key={prod.id}
                  className={`border-t border-slate-200 ${
                    bajoStock ? "bg-red-50 font-semibold text-red-800" : ""
                  }`}
                >
                  <td className="px-4 py-3">{prod.nombre}</td>
                  <td className="px-4 py-3">
                    {nombreCategoria(prod.categoria_id)}
                  </td>
                  <td className="px-4 py-3">
                    S/ {Number(prod.precio).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{prod.stock}</td>
                  <td className="px-4 py-3">{prod.stock_minimo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        bajoStock
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {bajoStock ? "Stock bajo" : "Stock normal"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Inventario;
