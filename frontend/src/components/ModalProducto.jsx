import { useState } from "react";

const FORMULARIO_VACIO = {
  nombre: "",
  precio: "",
  stock: "",
  stock_minimo: "",
  categoria_id: "",
  proveedor_id: "",
};

const CAMPOS = [
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "precio", label: "Precio (S/)", type: "number", step: "0.01" },
  { name: "stock", label: "Stock", type: "number" },
  { name: "stock_minimo", label: "Stock mínimo", type: "number" },
];

const formDesdeProducto = (p) =>
  p
    ? {
        nombre: p.nombre ?? "",
        precio: String(p.precio ?? ""),
        stock: String(p.stock ?? ""),
        stock_minimo: String(p.stock_minimo ?? ""),
        categoria_id: p.categoria_id ? String(p.categoria_id) : "",
        proveedor_id: p.proveedor_id ? String(p.proveedor_id) : "",
      }
    : FORMULARIO_VACIO;

const claseCampo = (hayError) =>
  `w-full min-h-11 rounded-lg border px-3 text-sm ${
    hayError ? "border-red-700" : "border-slate-300"
  }`;

const esEnteroValido = (valor) =>
  valor !== "" && Number.isInteger(Number(valor)) && Number(valor) >= 0;

const validar = (form) => {
  const errores = {};
  if (!form.nombre.trim()) errores.nombre = "El nombre es obligatorio.";
  if (form.precio === "" || Number(form.precio) <= 0)
    errores.precio = "Ingresa un precio mayor a 0.";
  if (!esEnteroValido(form.stock))
    errores.stock = "Ingresa un stock entero (0 o más).";
  if (!esEnteroValido(form.stock_minimo))
    errores.stock_minimo = "Ingresa un stock mínimo entero (0 o más).";
  if (!form.categoria_id) errores.categoria_id = "Selecciona una categoría.";
  if (!form.proveedor_id) errores.proveedor_id = "Selecciona un proveedor.";
  return errores;
};

function MensajeError({ id, texto }) {
  if (!texto) return null;
  return (
    <p id={id} role="alert" className="text-sm text-red-700">
      {texto}
    </p>
  );
}

function ModalProducto({
  producto,
  categorias,
  proveedores,
  onCerrar,
  onGuardado,
}) {
  const editando = Boolean(producto);
  const [form, setForm] = useState(() => formDesdeProducto(producto));
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: undefined });
  };

  const guardar = async (e) => {
    e.preventDefault();
    const nuevos = validar(form);
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    setErrorServidor("");
    try {
      const url = editando
        ? `http://localhost:3000/api/productos/${producto.id}`
        : "http://localhost:3000/api/productos";
      const res = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          precio: Number(form.precio),
          stock: Number(form.stock),
          stock_minimo: Number(form.stock_minimo),
          categoria_id: Number(form.categoria_id),
          proveedor_id: Number(form.proveedor_id),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "No se pudo guardar el producto.");
      }
      await onGuardado();
      onCerrar();
    } catch (err) {
      setErrorServidor(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor."
          : err.message,
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal"
    >
      <form
        onSubmit={guardar}
        noValidate
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="titulo-modal" className="mb-4 text-xl font-bold">
          {editando ? "Editar producto" : "Nuevo producto"}
        </h2>

        <div className="flex flex-col gap-4">
          {CAMPOS.map((c) => (
            <div key={c.name} className="flex flex-col gap-1">
              <label htmlFor={c.name} className="text-sm font-semibold">
                {c.label}
              </label>
              <input
                id={c.name}
                name={c.name}
                type={c.type}
                step={c.step}
                value={form[c.name]}
                onChange={cambiar}
                aria-invalid={Boolean(errores[c.name])}
                aria-describedby={`${c.name}-error`}
                className={claseCampo(errores[c.name])}
              />
              <MensajeError id={`${c.name}-error`} texto={errores[c.name]} />
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label htmlFor="categoria_id" className="text-sm font-semibold">
              Categoría
            </label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={form.categoria_id}
              onChange={cambiar}
              aria-invalid={Boolean(errores.categoria_id)}
              aria-describedby="categoria_id-error"
              className={claseCampo(errores.categoria_id)}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <MensajeError
              id="categoria_id-error"
              texto={errores.categoria_id}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="proveedor_id" className="text-sm font-semibold">
              Proveedor
            </label>
            <select
              id="proveedor_id"
              name="proveedor_id"
              value={form.proveedor_id}
              onChange={cambiar}
              aria-invalid={Boolean(errores.proveedor_id)}
              aria-describedby="proveedor_id-error"
              className={claseCampo(errores.proveedor_id)}
            >
              <option value="">Selecciona un proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <MensajeError
              id="proveedor_id-error"
              texto={errores.proveedor_id}
            />
          </div>
        </div>

        {errorServidor && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {errorServidor}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="min-h-11 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {enviando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ModalProducto;