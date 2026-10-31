export default function Recibo({ venta, onCerrar }) {
  if (!venta) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-80">
        <h2 className="text-lg font-bold mb-2">Venta #{venta.venta_id}</h2>
        <p className="text-sm text-gray-500 mb-4">{new Date().toLocaleString()}</p>

        <ul className="border-t border-b py-2 mb-4">
          {venta.productos.map((p, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span>{p.nombre} x{p.cantidad}</span>
              <span>S/ {(p.precio * p.cantidad).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <p className="text-right font-bold mb-4">
          Total: S/ {Number(venta.total).toFixed(2)}
        </p>

        <button onClick={onCerrar} className="w-full bg-blue-600 text-white py-2 rounded">
          Cerrar
        </button>
      </div>
    </div>
  );
}
