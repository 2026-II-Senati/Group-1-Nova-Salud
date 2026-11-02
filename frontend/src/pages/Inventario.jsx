import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ModalProducto from "../components/ModalProducto";

const MedidorStock = ({ stock, minimo }) => {
  const actual = Number(stock);
  const piso = Number(minimo);
  const bajo = actual < piso;
  const tope = Math.max(piso * 3, 1);
  const relleno = Math.min(100, (actual / tope) * 100);
  const marca = piso > 0 ? Math.min(100, (piso / tope) * 100) : null;

  return (
    <div className="flex items-center gap-3">
      <div
        role="img"
        aria-label={`Stock ${actual}, mínimo ${piso}`}
        className="relative h-2 w-24 shrink-0 overflow-hidden rounded-full bg-linea"
      >
        <div
          className={`h-full rounded-full ${bajo ? "bg-alerta" : "bg-botica"}`}
          style={{ width: `${relleno}%` }}
        />
        {marca !== null && (
          <div
            className="absolute inset-y-0 w-0.5 bg-tinta"
            style={{ left: `${marca}%` }}
          />
        )}
      </div>
      <span className="tabular-nums">
        <b className={bajo ? "text-alerta" : ""}>{actual}</b>
        <span className="text-tinta-suave"> / mín. {piso}</span>
      </span>
      {bajo && (
        <span className="text-sm font-semibold text-alerta">Stock bajo</span>
      )}
    </div>
  );
};

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  const cargarDatos = () =>
    Promise.all([
      fetch("http://localhost:3000/api/productos"),
      fetch("http://localhost:3000/api/categorias"),
      fetch("http://localhost:3000/api/proveedores"),
    ])
      .then(async ([resProd, resCat, resProv]) => {
        if (!resProd.ok || !resCat.ok || !resProv.ok) {
          throw new Error("Error del servidor");
        }
        const prods = await resProd.json();
        const cats = await resCat.json();
        const provs = await resProv.json();
        if (!Array.isArray(prods)) {
          setError("El backend no devolvió una lista válida.");
          return;
        }
        setProductos(prods);
        setCategorias(Array.isArray(cats) ? cats : []);
        setProveedores(Array.isArray(provs) ? provs : []);
      })
      .catch((err) => {
        console.error("Error al cargar el inventario:", err);
        setError("No se pudo conectar con el servidor.");
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirNuevo = () => {
    setProductoEditando(null);
    setModalAbierto(true);
  };

  const abrirEditar = (prod) => {
    setProductoEditando(prod);
    setModalAbierto(true);
  };

  const nombreCategoria = (id) =>
    categorias.find((c) => c.id === id)?.nombre || "-";

  const bajos = productos.filter((p) => p.stock < p.stock_minimo);

  if (loading)
    return <p className="pagina text-tinta-suave">Cargando inventario...</p>;
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
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">Inventario</h1>

        {bajos.length > 0 && (
          <Link
            to="/alertas"
            className="rounded-full bg-alerta-suave px-3 py-1 text-sm font-semibold text-alerta hover:bg-alerta hover:text-white"
          >
            {bajos.length === 1
              ? "1 producto con stock bajo"
              : `${bajos.length} productos con stock bajo`}
          </Link>
        )}

        <button
          type="button"
          onClick={abrirNuevo}
          className="btn btn-primario ml-auto"
        >
          Nuevo producto
        </button>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla min-w-[640px]">
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Categoría</th>
              <th scope="col" className="num">
                Precio
              </th>
              <th scope="col">Stock</th>
              <th scope="col">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod) => {
              const bajoStock = prod.stock < prod.stock_minimo;
              return (
                <tr key={prod.id} className={bajoStock ? "fila-alerta" : ""}>
                  <td className="font-semibold">{prod.nombre}</td>
                  <td>{nombreCategoria(prod.categoria_id)}</td>
                  <td className="num">S/ {Number(prod.precio).toFixed(2)}</td>
                  <td>
                    <MedidorStock
                      stock={prod.stock}
                      minimo={prod.stock_minimo}
                    />
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => abrirEditar(prod)}
                      aria-label={`Editar ${prod.nombre}`}
                      className="btn btn-chico btn-secundario"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <ModalProducto
          producto={productoEditando}
          categorias={categorias}
          proveedores={proveedores}
          onGuardado={cargarDatos}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </main>
  );
};

export default Inventario;
