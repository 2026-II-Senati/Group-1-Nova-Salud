import { useState, useEffect } from 'react';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const fetchProveedores = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/proveedores');
      const data = await res.json();
      setProveedores(data);
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return alert('El nombre es obligatorio');

    try {
      const res = await fetch('http://localhost:3000/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() })
      });

      if (res.ok) {
        setNombre('');
        fetchProveedores();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Error al crear proveedor');
      }
    } catch (error) {
      console.error('Error en POST /api/proveedores:', error);
    }
  };

  const handleDelete = async (id) => {
    const confirmacion = window.confirm('¿Está seguro de que desea eliminar este proveedor?');
    if (!confirmacion) return;

    try {
      const res = await fetch(`http://localhost:3000/api/proveedores/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchProveedores();
      } else {
        const errData = await res.json();
        alert(errData.message || 'No se pudo eliminar el proveedor');
      }
    } catch (error) {
      console.error('Error en DELETE /api/proveedores:', error);
    }
  };

  const obtenerTipoEntidad = (nombreProveedor) => {
    const nom = nombreProveedor.toUpperCase();
    if (nom.includes('SAC') || nom.includes('S.A.C.')) return 'S.A.C. (Persona Jurídica)';
    if (nom.includes('EIRL') || nom.includes('E.I.R.L.')) return 'E.I.R.L. (Empresa Individual)';
    if (nom.includes('SA') || nom.includes('S.A.')) return 'S.A. (Sociedad Anónima)';
    if (nom.includes('SRL') || nom.includes('S.R.L.')) return 'S.R.L. (Sociedad Limitada)';
    return 'Persona Natural / Negocio';
  };

  const proveedoresFiltrados = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Directorio de Proveedores</h2>
          <p className="text-sm text-gray-500">Módulo comercial para la gestión de proveedores de salud</p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-md border border-emerald-200">
          {proveedores.length} Registrados
        </span>
      </div>

      {/* Formulario y Búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <form onSubmit={handleSubmit} className="md:col-span-2 flex gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <input 
            type="text" 
            placeholder="Nombre o Razón Social del proveedor" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            required 
            className="border border-gray-300 px-4 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <button 
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            + Registrar
          </button>
        </form>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            className="w-full border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3.5 font-semibold text-xs text-gray-500 uppercase">#</th>
              <th className="px-5 py-3.5 font-semibold text-xs text-gray-500 uppercase">Código</th>
              <th className="px-5 py-3.5 font-semibold text-xs text-gray-500 uppercase">Razón Social</th>
              <th className="px-5 py-3.5 font-semibold text-xs text-gray-500 uppercase">Tipo de Entidad</th>
              <th className="px-5 py-3.5 font-semibold text-xs text-gray-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {proveedoresFiltrados.map((p, index) => (
              <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-4 text-sm text-gray-400 font-mono">{index + 1}</td>
                <td className="px-5 py-4 text-sm text-gray-600 font-mono">
                  PRV-{String(index + 1).padStart(4, '0')}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {p.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{p.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {obtenerTipoEntidad(p.nombre)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(p.id)} 
                    className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {proveedoresFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-gray-500 text-sm">
                  {busqueda ? 'No se encontraron proveedores que coincidan con la búsqueda' : 'No hay proveedores registrados'}
                </td>
              </tr>
            )}
          </tbody> 
        </table>
      </div>
    </div>
  );
}