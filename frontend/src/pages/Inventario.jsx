import React, { useEffect, useState } from 'react';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3000/api/productos'),
      fetch('http://localhost:3000/api/categorias'),
    ])
      .then(async ([resProd, resCat]) => {
        if (!resProd.ok || !resCat.ok) {
          throw new Error('Error del servidor');
        }
        const prods = await resProd.json();
        const cats = await resCat.json();
        if (!Array.isArray(prods)) {
          setError('El backend no devolvió una lista válida.');
          return;
        }
        setProductos(prods);
        setCategorias(Array.isArray(cats) ? cats : []);
      })
      .catch((err) => {
        console.error('Error al cargar el inventario:', err);
        setError('No se pudo conectar con el servidor.');
      })
      .finally(() => setLoading(false));
  }, []);

  const nombreCategoria = (id) =>
    categorias.find((c) => c.id === id)?.nombre || '-';

  if (loading) return <p style={{ padding: '24px' }}>Cargando inventario...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>Vista de Inventario</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Categoría</th>
            <th style={thStyle}>Precio</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Stock Mínimo</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod) => {
            const bajoStock = prod.stock < prod.stock_minimo;
            return (
              <tr
                key={prod.id}
                style={{
                  backgroundColor: bajoStock ? '#fee2e2' : 'transparent',
                  color: bajoStock ? '#991b1b' : '#374151',
                  fontWeight: bajoStock ? '600' : 'normal',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                <td style={tdStyle}>{prod.nombre}</td>
                <td style={tdStyle}>{nombreCategoria(prod.categoria_id)}</td>
                <td style={tdStyle}>S/. {Number(prod.precio).toFixed(2)}</td>
                <td style={tdStyle}>{prod.stock}</td>
                <td style={tdStyle}>{prod.stock_minimo}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = { padding: '12px 16px', fontSize: '14px', textTransform: 'uppercase' };
const tdStyle = { padding: '12px 16px', fontSize: '15px' };

export default Inventario;