import { useEffect, useState } from "react";

const API = "http://localhost:3000/api/productos";

const aSoles = (centimos) => (centimos / 100).toFixed(2);
const centimos = (precio) => Math.round(Number(precio) * 100);

const obtenerUsuarioId = () => {
  try {
    const token = localStorage.getItem("token");
    const cuerpo = token.split(".")[1];
    const json = atob(cuerpo.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json).id;
  } catch {
    return null;
  }
};

const Pos = () => {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(true);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [cobrando, setCobrando] = useState(false);
  const [errorCobro, setErrorCobro] = useState("");
  const [ventaRegistrada, setVentaRegistrada] = useState(null);
  const [ultimaBusqueda, setUltimaBusqueda] = useState("");

  const cargar = (q) => {
    const url = q ? `${API}/buscar?q=${encodeURIComponent(q)}` : API;
    return fetch(url)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.message || "No se pudo buscar el producto.");
        }
        setResultados(Array.isArray(data) ? data : []);
        setUltimaBusqueda(q);
      })
      .catch((err) => {
        setErrorBusqueda(
          err instanceof TypeError
            ? "No se pudo conectar con el servidor."
            : err.message,
        );
      })
      .finally(() => setBuscando(false));
  };

  useEffect(() => {
    cargar("");
  }, []);

  const buscar = (e) => {
    e.preventDefault();
    const q = busqueda.trim();
    if (!q) {
      setErrorBusqueda("Escribe el nombre de un producto para buscar.");
      return;
    }
    setBuscando(true);
    setErrorBusqueda("");
    cargar(q);
  };

  const verTodos = () => {
    setBusqueda("");
    setBuscando(true);
    setErrorBusqueda("");
    cargar("");
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

  const refrescarResultados = async () => {
    try {
      const url = ultimaBusqueda
        ? `${API}/buscar?q=${encodeURIComponent(ultimaBusqueda)}`
        : API;
      const res = await fetch(url);
      if (res.ok) setResultados(await res.json());
    } catch {
      // si falla, se mantiene la lista anterior
    }
  };

  const cobrar = async () => {
    const usuarioId = obtenerUsuarioId();
    if (!usuarioId) {
      setErrorCobro("Inicia sesión para registrar la venta.");
      return;
    }

    setCobrando(true);
    setErrorCobro("");
    setVentaRegistrada(null);
    try {
      const res = await fetch("http://localhost:3000/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuarioId,
          productos: carrito.map((i) => ({
            producto_id: i.id,
            cantidad: i.cantidad,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "No se pudo registrar la venta.");
      }
      setVentaRegistrada(data);
      setCarrito([]);
      refrescarResultados();
    } catch (err) {
      setErrorCobro(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor."
          : err.message,
      );
    } finally {
      setCobrando(false);
    }
  };

  const totalCentimos = carrito.reduce(
    (suma, i) => suma + centimos(i.precio) * i.cantidad,
    0,
  );

  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Punto de venta</h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <section aria-labelledby="titulo-busqueda">
          <h2 id="titulo-busqueda" className="mb-3 text-lg font-bold">
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
              className={`campo min-w-48 flex-1 ${
                errorBusqueda ? "campo-error" : ""
              }`}
            />
            <button
              type="submit"
              disabled={buscando}
              className="btn btn-primario"
            >
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {errorBusqueda && (
            <p id="error-busqueda" role="alert" className="texto-error mb-3">
              {errorBusqueda}
            </p>
          )}

          {(resultados.length > 0 || ultimaBusqueda) && (
            <p
              aria-live="polite"
              className="mb-3 flex flex-wrap items-center gap-3 text-sm text-tinta-suave"
            >
              <span>
                {ultimaBusqueda
                  ? `${resultados.length} ${
                      resultados.length === 1 ? "resultado" : "resultados"
                    } para “${ultimaBusqueda}”`
                  : `${resultados.length} ${
                      resultados.length === 1 ? "producto" : "productos"
                    }`}
              </span>
              {ultimaBusqueda && (
                <button
                  type="button"
                  onClick={verTodos}
                  className="btn btn-chico btn-secundario"
                >
                  Ver todos
                </button>
              )}
            </p>
          )}

          {buscando && resultados.length === 0 && (
            <p className="text-tinta-suave">Cargando productos...</p>
          )}

          {!buscando && resultados.length === 0 && !errorBusqueda && (
            <p className="panel px-4 py-6 text-center text-tinta-suave">
              No se encontraron productos.
            </p>
          )}

          {resultados.length > 0 && (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3">
              {resultados.map((prod) => {
                const bajo = Number(prod.stock) < Number(prod.stock_minimo);
                const enCarrito = carrito.find(
                  (i) => i.id === prod.id,
                )?.cantidad;
                return (
                  <li
                    key={prod.id}
                    className="panel flex flex-col justify-between gap-4 p-4"
                  >
                    <div>
                      <h3 className="font-semibold leading-snug">
                        {prod.nombre}
                      </h3>
                      <p
                        className={`mt-1 text-sm ${
                          bajo
                            ? "font-semibold text-alerta"
                            : "text-tinta-suave"
                        }`}
                      >
                        {bajo
                          ? `Quedan ${prod.stock}`
                          : `${prod.stock} en stock`}
                      </p>
                      {enCarrito && (
                        <p className="mt-1 text-sm font-semibold text-botica-oscuro">
                          En el carrito: {enCarrito}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xl font-bold tabular-nums">
                        S/ {aSoles(centimos(prod.precio))}
                      </p>
                      <button
                        type="button"
                        onClick={() => agregar(prod)}
                        aria-label={`Agregar ${prod.nombre}`}
                        className="btn btn-chico btn-secundario"
                      >
                        Agregar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="titulo-carrito"
          className="panel p-5 lg:sticky lg:top-8"
        >
          <h2 id="titulo-carrito" className="mb-2 text-lg font-bold">
            Carrito
          </h2>

          {carrito.length === 0 ? (
            <p className="py-6 text-center text-tinta-suave">
              El carrito está vacío.
            </p>
          ) : (
            <ul className="divide-y divide-linea">
              {carrito.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{item.nombre}</p>
                    <p className="font-semibold tabular-nums">
                      S/ {aSoles(centimos(item.precio) * item.cantidad)}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(item.id, -1)}
                        disabled={item.cantidad <= 1}
                        aria-label={`Quitar una unidad de ${item.nombre}`}
                        className="btn btn-chico btn-secundario w-9"
                      >
                        -
                      </button>
                      <span
                        aria-label={`Cantidad de ${item.nombre}`}
                        className="w-8 text-center font-semibold tabular-nums"
                      >
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(item.id, 1)}
                        aria-label={`Agregar una unidad de ${item.nombre}`}
                        className="btn btn-chico btn-secundario w-9"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => quitar(item.id)}
                      aria-label={`Quitar ${item.nombre} del carrito`}
                      className="btn btn-chico btn-peligro"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 border-t border-dashed border-borde-campo pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-lg font-semibold">Total</p>
              <p
                data-testid="total-carrito"
                className="text-3xl font-bold tabular-nums text-botica-oscuro"
              >
                S/ {aSoles(totalCentimos)}
              </p>
            </div>

            <button
              type="button"
              onClick={cobrar}
              disabled={carrito.length === 0 || cobrando}
              className="btn btn-primario mt-4 w-full"
            >
              {cobrando ? "Cobrando..." : "Cobrar"}
            </button>
          </div>

          {errorCobro && (
            <p role="alert" className="mensaje-error mt-4">
              {errorCobro}
            </p>
          )}

          {ventaRegistrada && (
            <p role="status" className="mensaje-ok mt-4">
              Venta #{ventaRegistrada.venta_id} registrada. Total: S/{" "}
              {Number(ventaRegistrada.total).toFixed(2)}
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default Pos;
