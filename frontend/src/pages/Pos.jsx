import { useState } from "react";

const API = "http://localhost:3000/api/productos";

const aSoles = (centimos) => (centimos / 100).toFixed(2);
const centimos = (precio) => Math.round(Number(precio) * 100);

const Pos = () => {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);

  const buscar = async (e) => {
    e.preventDefault();
    const q = busqueda.trim();
    if (!q) {
      setErrorBusqueda("Escribe el nombre de un producto para buscar.");
      return;
    }

    setBuscando(true);
    setErrorBusqueda("");
    try {
      const res = await fetch(`${API}/buscar?q=${encodeURIComponent(q)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "No se pudo buscar el producto.");
      }
      setResultados(Array.isArray(data) ? data : []);
    } catch (err) {
      setResultados(null);
      setErrorBusqueda(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor."
          : err.message,
      );
    } finally {
      setBuscando(false);
    }
  };

  const agregar = (prod) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.id === prod.id);
      if (existe) {
        return prev.map((i) =>
          i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i,
        );
      }
      return [
        ...prev,
        { id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 },
      ];
    });
  };

  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i,
      ),
    );
  };

  const quitar = (id) => {
    setCarrito((prev) => prev.filter((i) => i.id !== id));
  };

  const totalCentimos = carrito.reduce(
    (suma, i) => suma + centimos(i.precio) * i.cantidad,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 sm:p-8">
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">Punto de venta</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="titulo-busqueda">
          <h2 id="titulo-busqueda" className="mb-3 text-lg font-semibold">
            Buscar productos
          </h2>

          <form
            onSubmit={buscar}
            noValidate
            className="mb-3 flex flex-wrap gap-3"
          >
            <label htmlFor="busqueda-pos" className="sr-only">
              Nombre del producto
            </label>
            <input
              id="busqueda-pos"
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setErrorBusqueda("");
              }}
              placeholder="Ej: paracetamol"
              aria-invalid={Boolean(errorBusqueda)}
              aria-describedby={errorBusqueda ? "error-busqueda" : undefined}
              className={`min-h-11 min-w-48 flex-1 rounded-lg border bg-white px-3 text-sm ${
                errorBusqueda ? "border-red-700" : "border-slate-300"
              }`}
            />
            <button
              type="submit"
              disabled={buscando}
              className="min-h-11 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {errorBusqueda && (
            <p
              id="error-busqueda"
              role="alert"
              className="mb-3 text-sm text-red-700"
            >
              {errorBusqueda}
            </p>
          )}

          {resultados !== null && resultados.length === 0 && (
            <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
              No se encontraron productos.
            </p>
          )}

          {resultados !== null && resultados.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Producto
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Precio
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Stock
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((prod) => (
                    <tr key={prod.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{prod.nombre}</td>
                      <td className="px-4 py-3">
                        S/ {aSoles(centimos(prod.precio))}
                      </td>
                      <td className="px-4 py-3">{prod.stock}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => agregar(prod)}
                          aria-label={`Agregar ${prod.nombre}`}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                        >
                          Agregar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="titulo-carrito">
          <h2 id="titulo-carrito" className="mb-3 text-lg font-semibold">
            Carrito
          </h2>

          {carrito.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
              El carrito está vacío.
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
                      Cantidad
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Subtotal
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{item.nombre}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(item.id, -1)}
                            disabled={item.cantidad <= 1}
                            aria-label={`Quitar una unidad de ${item.nombre}`}
                            className="h-8 w-8 rounded-lg border border-slate-300 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40"
                          >
                            -
                          </button>
                          <span
                            aria-label={`Cantidad de ${item.nombre}`}
                            className="w-6 text-center font-semibold"
                          >
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(item.id, 1)}
                            aria-label={`Agregar una unidad de ${item.nombre}`}
                            className="h-8 w-8 rounded-lg border border-slate-300 bg-white font-semibold hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        S/ {aSoles(centimos(item.precio) * item.cantidad)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => quitar(item.id)}
                          aria-label={`Quitar ${item.nombre} del carrito`}
                          className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-lg font-semibold">
              Total:{" "}
              <span data-testid="total-carrito" className="text-teal-700">
                S/ {aSoles(totalCentimos)}
              </span>
            </p>
            <button
              type="button"
              disabled={carrito.length === 0}
              className="min-h-11 rounded-lg bg-teal-700 px-6 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              Cobrar
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Pos;
