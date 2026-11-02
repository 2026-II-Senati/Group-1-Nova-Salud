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
    return <p className="pagina text-tinta-suave">Cargando categorías...</p>;
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
      <h1 className="titulo-pagina">Categorías</h1>

      <form onSubmit={guardar} noValidate className="panel mb-5 p-4">
        <label htmlFor="nombre-categoria" className="etiqueta">
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
            className={`campo min-w-60 flex-1 ${errorForm ? "campo-error" : ""}`}
          />
          <button
            type="submit"
            disabled={enviando}
            className="btn btn-primario"
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
              className="btn btn-secundario"
            >
              Cancelar
            </button>
          )}
        </div>
        {errorForm && (
          <p id="error-categoria" role="alert" className="texto-error mt-2">
            {errorForm}
          </p>
        )}
      </form>

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
            {categorias.map((cat) => (
              <tr
                key={cat.id}
                className={editando?.id === cat.id ? "bg-botica-suave" : ""}
              >
                <td className="text-tinta-suave">{cat.id}</td>
                <td className="font-semibold">{cat.nombre}</td>
                <td className="text-right">
                  <button
                    type="button"
                    onClick={() => iniciarEdicion(cat)}
                    aria-label={`Editar ${cat.nombre}`}
                    className="btn btn-chico btn-secundario"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan="3" className="py-6 text-center text-tinta-suave">
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
