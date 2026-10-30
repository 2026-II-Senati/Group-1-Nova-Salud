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
    return <p className="p-6 text-slate-600">Cargando proveedores...</p>;
  if (errorCarga)
    return (
      <p role="alert" className="p-6 text-red-700">
        Error: {errorCarga}
      </p>
    );

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 sm:p-8">
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">Proveedores</h1>

      <form
        onSubmit={crear}
        noValidate
        className="mb-5 rounded-xl border border-slate-200 bg-white p-4"
      >
        <label htmlFor="nombre-proveedor" className="text-sm font-semibold">
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
            className={`min-h-11 min-w-60 flex-1 rounded-lg border px-3 text-sm ${
              errorForm ? "border-red-700" : "border-slate-300"
            }`}
          />
          <button
            type="submit"
            disabled={enviando}
            className="min-h-11 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {enviando ? "Guardando..." : "Crear proveedor"}
          </button>
        </div>
        {errorForm && (
          <p id="error-proveedor" role="alert" className="mt-2 text-sm text-red-700">
            {errorForm}
          </p>
        )}
      </form>

      {errorEliminar && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {errorEliminar}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                ID
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((prov) => (
              <tr key={prov.id} className="border-t border-slate-200">
                <td className="px-4 py-3">{prov.id}</td>
                <td className="px-4 py-3">{prov.nombre}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => eliminar(prov)}
                    disabled={eliminandoId === prov.id}
                    aria-label={`Eliminar ${prov.nombre}`}
                    className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {eliminandoId === prov.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
            {proveedores.length === 0 && (
              <tr>
                <td colSpan="3" className="px-4 py-6 text-center text-slate-500">
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
