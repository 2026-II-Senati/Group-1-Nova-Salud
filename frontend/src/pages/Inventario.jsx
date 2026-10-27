import React, { useEffect, useState } from 'react';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/productos')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          setError('El backend no devolvió una lista válida.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar productos:', err);
        setError('No se pudo conectar con el servidor.');
        setLoading(false);
      });
  }, []);

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
                <td style={tdStyle}>{prod.categoria || '-'}</td>
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