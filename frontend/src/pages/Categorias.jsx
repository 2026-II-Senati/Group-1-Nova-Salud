import { useEffect, useRef, useState } from "react";

const API = "http://localhost:3000/api/categorias";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [nombre, setNombre] = useState("");
  const [editando, setEditando] = useState(null);
  const [errorForm, setErrorForm] = useState("");
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(API)
      .then(async (res) => {
        if (!res.ok) throw new Error("Error del servidor");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Respuesta inválida");
        setCategorias(data);
      })
      .catch((err) => {
        console.error("Error al cargar las categorías:", err);
        setErrorCarga("No se pudo conectar con el servidor.");
      })
      .finally(() => setLoading(false));
  }, []);

  const cancelar = () => {
    setNombre("");
    setEditando(null);
    setErrorForm("");
  };

  const iniciarEdicion = (cat) => {
    setEditando(cat);
    setNombre(cat.nombre);
    setErrorForm("");
    inputRef.current?.focus();
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorForm("El nombre es obligatorio.");
      return;
    }

    setEnviando(true);
    setErrorForm("");
    try {
      const res = await fetch(editando ? `${API}/${editando.id}` : API, {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "No se pudo guardar la categoría.");
      }
      setCategorias((prev) =>
        editando
          ? prev.map((c) => (c.id === data.id ? data : c))
          : [...prev, data],
      );
      cancelar();
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

  if (loading)
    return <p className="p-6 text-slate-600">Cargando categorías...</p>;
  if (errorCarga)
    return (
      <p role="alert" className="p-6 text-red-700">
        Error: {errorCarga}
      </p>
    );

  return (
    <main className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 sm:p-8">
      <h1 className="mb-5 text-2xl font-bold sm:text-3xl">Categorías</h1>

      <form
        onSubmit={guardar}
        noValidate
        className="mb-5 rounded-xl border border-slate-200 bg-white p-4"
      >
        <label htmlFor="nombre-categoria" className="text-sm font-semibold">
          {editando ? "Editar categoría" : "Nueva categoría"}
        </label>
        <div className="mt-1 flex flex-wrap gap-3">
          <input
            id="nombre-categoria"
            ref={inputRef}
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setErrorForm("");
            }}
            aria-invalid={Boolean(errorForm)}
            aria-describedby={errorForm ? "error-categoria" : undefined}
            className={`min-h-11 min-w-60 flex-1 rounded-lg border px-3 text-sm ${
              errorForm ? "border-red-700" : "border-slate-300"
            }`}
          />
          <button
            type="submit"
            disabled={enviando}
            className="min-h-11 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {enviando
              ? "Guardando..."
              : editando
                ? "Guardar cambios"
                : "Crear categoría"}
          </button>
          {editando && (
            <button
              type="button"
              onClick={cancelar}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Cancelar
            </button>
          )}
        </div>
        {errorForm && (
          <p id="error-categoria" role="alert" className="mt-2 text-sm text-red-700">
            {errorForm}
          </p>
        )}
      </form>

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
            {categorias.map((cat) => (
              <tr key={cat.id} className="border-t border-slate-200">
                <td className="px-4 py-3">{cat.id}</td>
                <td className="px-4 py-3">{cat.nombre}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => iniciarEdicion(cat)}
                    aria-label={`Editar ${cat.nombre}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan="3" className="px-4 py-6 text-center text-slate-500">
                  No hay categorías registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Categorias;
