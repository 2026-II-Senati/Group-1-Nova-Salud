import { useEffect, useState } from "react";

const API = "http://localhost:3000/api/ventas";
const fechaHoy = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local

export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [desde, setDesde] = useState(fechaHoy());
  const [hasta, setHasta] = useState(fechaHoy());
  const [vendedor, setVendedor] = useState("");
  const [vendedores, setVendedores] = useState([]);
  const [error, setError] = useState("");

  const cargar = (filtros = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filtros).filter(([, v]) => v),
    ).toString();

    return fetch(qs ? `${API}?${qs}` : API)
      .then((res) => {
        if (!res.ok) throw new Error("Error del servidor");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Respuesta inválida");
        setVentas(data);
        // Las opciones del selector se arman solo cuando no se filtra por vendedor,
        // para que no se reduzcan a la persona elegida.
        if (!filtros.vendedor) {
          setVendedores(
            [...new Set(data.map((v) => v.vendedor))].filter(Boolean),
          );
        }
        setError("");
      })
      .catch(() => setError("No se pudo conectar con el servidor."));
  };

  useEffect(() => {
    cargar({ desde: fechaHoy(), hasta: fechaHoy() });
  }, []);

  const verDetalle = (id) => {
    fetch(`${API}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error del servidor");
        return res.json();
      })
      .then((data) => {
        setDetalle(data);
        setError("");
      })
      .catch(() => setError("No se pudo cargar el detalle de la venta."));
  };

  const limpiar = () => {
    const hoy = fechaHoy();
    setDesde(hoy);
    setHasta(hoy);
    setVendedor("");
    setDetalle(null);
    cargar({ desde: hoy, hasta: hoy });
  };

  // El detalle del servidor no trae el vendedor; se toma de la lista.
  const vendedorDelDetalle = ventas.find((v) => v.id === detalle?.id)?.vendedor;

  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Historial de ventas</h1>

      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div className="flex-1 min-w-32">
          <label htmlFor="desde" className="etiqueta">
            Desde
          </label>
          <input
            id="desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="campo w-full"
          />
        </div>
        <div className="flex-1 min-w-32">
          <label htmlFor="hasta" className="etiqueta">
            Hasta
          </label>
          <input
            id="hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="campo w-full"
          />
        </div>
        <div className="flex-1 min-w-40">
          <label htmlFor="vendedor" className="etiqueta">
            Vendedor
          </label>
          <select
            id="vendedor"
            value={vendedor}
            onChange={(e) => setVendedor(e.target.value)}
            className="campo w-full"
          >
            <option value="">Todos los vendedores</option>
            {vendedores.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primario"
          onClick={() => cargar({ desde, hasta, vendedor })}
        >
          Filtrar
        </button>
        <button className="btn btn-secundario" onClick={limpiar}>
          Limpiar
        </button>
      </div>

      {error && (
        <p role="alert" className="mensaje-error mb-4">
          {error}
        </p>
      )}

      {!error && (
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="panel flex-1 min-w-0 w-full">
          <div className="max-h-[480px] overflow-y-auto divide-y divide-linea">
            {ventas.map((v) => (
              <button
                key={v.id}
                onClick={() => verDetalle(v.id)}
                className={`w-full text-left px-4 py-3 grid grid-cols-[auto_1fr_auto] gap-3 text-sm ${
                  detalle?.id === v.id ? "bg-botica-suave" : "hover:bg-papel"
                }`}
              >
                <span className="font-semibold">#{v.id}</span>
                <span className="text-tinta-suave">
                  {v.vendedor} · {new Date(v.fecha).toLocaleString()}
                </span>
                <span className="font-semibold">
                  S/ {Number(v.total).toFixed(2)}
                </span>
              </button>
            ))}
            {ventas.length === 0 && (
              <p className="p-4 text-tinta-suave">
                No hay ventas en ese rango.
              </p>
            )}
          </div>
        </div>

        <aside className="panel p-4 w-full lg:w-96 lg:sticky lg:top-6 shrink-0">
          {detalle ? (
            <>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-bold">Venta #{detalle.id}</span>
                <span className="text-tinta-suave">{vendedorDelDetalle}</span>
              </div>
              <ul className="text-sm space-y-2">
                {detalle.detalle.map((d, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>
                      {d.nombre} × {d.cantidad}
                    </span>
                    <span className="whitespace-nowrap">
                      S/ {(d.precio_unitario * d.cantidad).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-linea mt-4 pt-3 flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  S/ {Number(detalle.total).toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-tinta-suave text-sm">
              Elige una venta de la lista para ver el detalle.
            </p>
          )}
        </aside>
      </div>
      )}
    </main>
  );
}
