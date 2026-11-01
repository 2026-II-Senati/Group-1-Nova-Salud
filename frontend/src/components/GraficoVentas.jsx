import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function GraficoVentas() {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/dashboard/ventas-semana')
      .then((r) => r.json())
      .then(setDatos)
      .catch((err) => console.error('Error al cargar ventas:', err));
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Ventas de los últimos 7 días</h2>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos}>
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
