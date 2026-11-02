import React, { useState, useEffect } from 'react';
import { getMovimientos } from '../services/movimientosService';

export const HistorialInventario = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovimientos = async (fecha = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMovimientos(fecha);
      setMovimientos(data);
    } catch (err) {
      setError('No se pudo cargar el historial de movimientos.');
      setMovimientos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos(fechaFiltro);
  }, [fechaFiltro]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Historial de Inventario</h1>
          <p className="text-gray-600">Registro de movimientos de entrada y salida</p>
        </div>

        {/* Filtro por fecha */}
        <div className="flex items-center gap-2">
          <label htmlFor="fecha" className="text-sm font-medium text-gray-700">
            Filtrar por fecha:
          </label>
          <input
            type="date"
            id="fecha"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {fechaFiltro && (
            <button
              onClick={() => setFechaFiltro('')}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Movimientos (Reutilizando diseño estandarizado) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-600 uppercase">
              <th className="p-4">Producto</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Cantidad</th>
              <th className="p-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  Cargando movimientos...
                </td>
              </tr>
            ) : error || movimientos.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No hay movimientos registrados
                </td>
              </tr>
            ) : (
              movimientos.map((mov) => (
                <tr key={mov.id || mov.movimiento_id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">
                    {mov.producto_nombre || mov.producto}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        mov.tipo?.toLowerCase() === 'entrada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {mov.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">{mov.cantidad}</td>
                  <td className="p-4 text-gray-500">
                    {new Date(mov.fecha).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};