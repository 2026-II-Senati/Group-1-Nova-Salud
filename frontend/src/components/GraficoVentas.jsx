import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const etiquetaDia = (fecha) =>
  new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
  });

const soles = (valor) => `S/ ${Number(valor).toFixed(2)}`;

export default function GraficoVentas() {
  const [datos, setDatos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/dashboard/ventas-semana")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) throw new Error("Respuesta inválida");
        setDatos(data);
      })
      .catch((err) => {
        console.error("Error al cargar ventas:", err);
        setError("No se pudieron cargar las ventas de la semana.");
      });
  }, []);

  const hayVentas = datos.some((d) => d.total > 0);

  return (
    <section className="panel p-5">
      <h2 className="mb-4 text-lg font-bold">Ventas de los últimos 7 días</h2>

      {error ? (
        <p role="alert" className="mensaje-error">
          {error}
        </p>
      ) : (
        <>
          {datos.length > 0 && !hayVentas && (
            <p className="mb-2 text-sm text-tinta-suave">
              Todavía no hay ventas en estos 7 días.
            </p>
          )}
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#d3dedb" />
              <XAxis
                dataKey="fecha"
                tickFormatter={etiquetaDia}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => `S/ ${v}`}
                tickLine={false}
                axisLine={false}
                width={64}
              />
              <Tooltip
                formatter={(v) => [soles(v), "Ventas"]}
                labelFormatter={etiquetaDia}
                cursor={{ fill: "#e2f1ee" }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {datos.map((d, i) => (
                  <Cell
                    key={d.fecha}
                    fill={i === datos.length - 1 ? "#0f766e" : "#4f9e95"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </section>
  );
}
