import { useState, useEffect } from 'react';
import { getMovimientos } from '../services/movimientosService';

export const HistorialInventario = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = (fecha) =>
    getMovimientos(fecha)
      .then((data) => {
        setMovimientos(data);
        setError(null);
      })
      .catch(() => {
        setError('No se pudo cargar el historial de movimientos.');
        setMovimientos([]);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar(fechaFiltro);
  }, [fechaFiltro]);

  const cambiarFecha = (valor) => {
    setLoading(true);
    setFechaFiltro(valor);
  };

  return (
    <main className="pagina">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Historial de inventario</h1>
          <p className="mt-1 text-tinta-suave">
            Registro de movimientos de entrada y salida
          </p>
        </div>

        {/* Filtro por fecha */}
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="fecha" className="etiqueta">
            Filtrar por fecha
          </label>
          <input
            type="date"
            id="fecha"
            value={fechaFiltro}
            onChange={(e) => cambiarFecha(e.target.value)}
            className="campo w-auto"
          />
          {fechaFiltro && (
            <button
              type="button"
              onClick={() => cambiarFecha('')}
              className="btn btn-secundario"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mensaje-error mb-5">
          {error}
        </p>
      )}

      <div className="tabla-contenedor">
        <table className="tabla min-w-[420px]">
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Tipo</th>
              <th scope="col" className="num">
                Cantidad
              </th>
              <th scope="col">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-tinta-suave">
                  Cargando movimientos...
                </td>
              </tr>
            ) : movimientos.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-tinta-suave">
                  No hay movimientos registrados
                </td>
              </tr>
            ) : (
              movimientos.map((mov) => (
                <tr key={mov.id || mov.movimiento_id}>
                  <td className="font-semibold">
                    {mov.producto_nombre || mov.producto}
                  </td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        mov.tipo?.toLowerCase() === 'entrada'
                          ? 'bg-botica-suave text-botica-oscuro'
                          : 'bg-alerta-suave text-alerta'
                      }`}
                    >
                      {mov.tipo}
                    </span>
                  </td>
                  <td className="num">{mov.cantidad}</td>
                  <td className="text-tinta-suave">
                    {new Date(mov.fecha).toLocaleDateString('es-PE')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};