export default function Recibo({ venta, onCerrar }) {
  if (!venta) return null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-tinta/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-recibo"
    >
      <div className="w-full max-w-xs rounded-xl bg-white p-6 shadow-xl">
        <h2 id="titulo-recibo" className="text-lg font-bold">
          Venta #{venta.venta_id}
        </h2>
        <p className="mb-4 text-sm text-tinta-suave">
          {new Date().toLocaleString("es-PE")}
        </p>

        <ul className="mb-4 flex flex-col gap-1 border-y border-dashed border-borde-campo py-3">
          {venta.productos.map((p, i) => (
            <li key={i} className="flex justify-between gap-3 text-sm">
              <span>
                {p.nombre} x{p.cantidad}
              </span>
              <span className="tabular-nums">
                S/ {(p.precio * p.cantidad).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <p className="mb-4 flex items-baseline justify-between gap-3">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold tabular-nums text-botica-oscuro">
            S/ {Number(venta.total).toFixed(2)}
          </span>
        </p>

        <button
          type="button"
          onClick={onCerrar}
          className="btn btn-primario w-full"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
