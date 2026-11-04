import { useEffect, useRef, useState } from "react";

const API = "http://localhost:3000/api/proveedores";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [nombre, setNombre] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [errorEliminar, setErrorEliminar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(API)
      .then(async (res) => {
        if (!res.ok) throw new Error("Error del servidor");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Respuesta inválida");
        setProveedores(data);
      })
      .catch((err) => {
        console.error("Error al cargar los proveedores:", err);
        setErrorCarga("No se pudo conectar con el servidor.");
      })
      .finally(() => setLoading(false));
  }, []);

  const crear = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorForm("El nombre es obligatorio.");
      return;
    }

    if (nombre.trim().length > 100) {
      setErrorForm("El nombre no puede pasar de 100 caracteres.");
      return;
    }

    setEnviando(true);
    setErrorForm("");
    setErrorEliminar("");
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "No se pudo crear el proveedor.");
      }
      setProveedores((prev) => [...prev, data]);
      setNombre("");
      inputRef.current?.focus();
    } catch (err) {
      setErrorForm(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor."
          : err.message,
      );
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (prov) => {
    if (!window.confirm(`¿Eliminar al proveedor "${prov.nombre}"?`)) return;

    setEliminandoId(prov.id);
    setErrorEliminar("");
    try {
      const res = await fetch(`${API}/${prov.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "No se pudo eliminar el proveedor.");
      }
      setProveedores((prev) => prev.filter((p) => p.id !== prov.id));
    } catch (err) {
      setErrorEliminar(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor."
          : err.message,
      );
    } finally {
      setEliminandoId(null);
    }
  };

  if (loading)
    return <p className="pagina text-tinta-suave">Cargando proveedores...</p>;
  if (errorCarga)
    return (
      <main className="pagina">
        <p role="alert" className="mensaje-error">
          Error: {errorCarga}
        </p>
      </main>
    );

  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Proveedores</h1>

      <form onSubmit={crear} noValidate className="panel mb-5 p-4">
        <label htmlFor="nombre-proveedor" className="etiqueta">
          Nuevo proveedor
        </label>
        <div className="mt-1 flex flex-wrap gap-3">
          <input
            id="nombre-proveedor"
            ref={inputRef}
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setErrorForm("");
            }}
            aria-invalid={Boolean(errorForm)}
            aria-describedby={errorForm ? "error-proveedor" : undefined}
            className={`campo min-w-60 flex-1 ${errorForm ? "campo-error" : ""}`}
          />
          <button
            type="submit"
            disabled={enviando}
            className="btn btn-primario"
          >
            {enviando ? "Guardando..." : "Crear proveedor"}
          </button>
        </div>
        {errorForm && (
          <p id="error-proveedor" role="alert" className="texto-error mt-2">
            {errorForm}
          </p>
        )}
      </form>

      {errorEliminar && (
        <p role="alert" className="mensaje-error mb-5">
          {errorEliminar}
        </p>
      )}

      <div className="tabla-contenedor">
        <table className="tabla min-w-[420px]">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((prov) => (
              <tr key={prov.id}>
                <td className="text-tinta-suave">{prov.id}</td>
                <td className="font-semibold">{prov.nombre}</td>
                <td className="text-right">
                  <button
                    type="button"
                    onClick={() => eliminar(prov)}
                    disabled={eliminandoId === prov.id}
                    aria-label={`Eliminar ${prov.nombre}`}
                    className="btn btn-chico btn-peligro"
                  >
                    {eliminandoId === prov.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
            {proveedores.length === 0 && (
              <tr>
                <td colSpan="3" className="py-6 text-center text-tinta-suave">
                  No hay proveedores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Proveedores;
