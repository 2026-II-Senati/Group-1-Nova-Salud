import { useState } from 'react';

const FORMULARIO_VACIO = {
  nombre: '',
  precio: '',
  stock: '',
  stock_minimo: '',
  categoria_id: '',
  proveedor_id: '',
};

// TEMPORAL: ids de nova_salud.sql. Cambiar por GET /api/proveedores cuando
// esté lista la T33.
const PROVEEDORES_PRUEBA = [
  { id: 1, nombre: 'Distribuidora Lima SAC' },
  { id: 2, nombre: 'Farmacéutica del Norte' },
  { id: 3, nombre: 'Import Pharma EIRL' },
];

const CAMPOS = [
  { name: 'nombre', label: 'Nombre', type: 'text' },
  { name: 'precio', label: 'Precio (S/)', type: 'number', step: '0.01' },
  { name: 'stock', label: 'Stock', type: 'number' },
  { name: 'stock_minimo', label: 'Stock mínimo', type: 'number' },
];

const claseCampo =
  'w-full min-h-11 rounded-lg border border-slate-300 px-3 text-sm';

function ModalProducto({ abierto, categorias, onCerrar }) {
  const [form, setForm] = useState(FORMULARIO_VACIO);

  if (!abierto) return null;

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cerrar = () => {
    setForm(FORMULARIO_VACIO);
    onCerrar();
  };

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal"
    >
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="titulo-modal" className="mb-4 text-xl font-bold">
          Nuevo producto
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
                className={claseCampo}
              />
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
              className={claseCampo}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
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
              className={claseCampo}
            >
              <option value="">Selecciona un proveedor</option>
              {PROVEEDORES_PRUEBA.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={cerrar}
            className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ModalProducto;