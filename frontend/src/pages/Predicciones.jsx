import { useState } from "react";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Datos inventados (solo para validar el diseño): ventas diarias proyectadas a 30 días.
const PROYECCION = [
  6076000, 238000, 5970000, 5995000, 5949000, 5945000, 6123000,
  5861000, 229000, 5660000, 5628000, 5668000, 5933000, 6270000,
  5581000, 247000, 5478000, 5531000, 5597000, 5593000, 5739000,
  5679000, 248000, 5688000, 5549000, 5546000, 5546000, 5671000,
  5676000, 248000,
];

// Datos inventados: ventas reales de los 14 días anteriores.
const HISTORICO = [
  6054000, 269000, 7540000, 6393000, 6916000, 6938000, 7065000,
  6262000, 277000, 10841000, 9340000, 8756000, 8374000, 7949000,
];

// dia(0) = "2015-07-04", dia(1) = "2015-07-05", ... (el mes 6 es julio: JavaScript cuenta desde 0)
const dia = (n) => new Date(Date.UTC(2015, 6, 4 + n)).toISOString().slice(0, 10);

// Mismo formateador de fechas que usa GraficoVentas: "sáb 4"
const etiquetaDia = (fecha) =>
  new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
  });

// 36296000 -> "36,296,000"
const formatear = (n) => n.toLocaleString("es-PE");

const Predicciones = () => {
  // horizonte = cuántos días hacia adelante queremos predecir (7 o 30)
  const [horizonte, setHorizonte] = useState(7);

  // Tomamos solo los primeros 7 o 30 días, según el botón elegido
  const dias = PROYECCION.slice(0, horizonte);
  const total = dias.reduce((suma, valor) => suma + valor, 0);
  const promedio = Math.round(total / dias.length);

  // Recharts dibuja una línea por cada campo: "historico" y "proyeccion"
  const serie = [
    ...HISTORICO.map((valor, i) => ({
      fecha: dia(i),
      historico: valor,
      // el último día real también inicia la línea punteada, para que ambas se unan
      proyeccion: i === HISTORICO.length - 1 ? valor : null,
    })),
    ...dias.map((valor, i) => ({
      fecha: dia(HISTORICO.length + i),
      proyeccion: valor,
    })),
  ];

  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Predicciones de ventas</h1>

      <div className="flex gap-3 mb-5">
        <button
          type="button"
          className={horizonte === 7 ? "btn btn-primario" : "btn btn-secundario"}
          onClick={() => setHorizonte(7)}
        >
          Próximos 7 días
        </button>
        <button
          type="button"
          className={horizonte === 30 ? "btn btn-primario" : "btn btn-secundario"}
          onClick={() => setHorizonte(30)}
        >
          Próximo mes
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-tinta-suave">
            Total proyectado ({horizonte === 7 ? "próximos 7 días" : "próximo mes"})
          </h2>
          <p className="mt-2 text-4xl font-bold tabular-nums text-botica">
            {formatear(total)}
          </p>
        </section>

        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-tinta-suave">Promedio diario</h2>
          <p className="mt-2 text-4xl font-bold tabular-nums text-tinta">
            {formatear(promedio)}
          </p>
        </section>
      </div>

      <section className="panel mt-4 p-5">
        <h2 className="mb-4 text-lg font-bold">Histórico y proyección</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={serie} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#d3dedb" />
            <XAxis
              dataKey="fecha"
              tickFormatter={etiquetaDia}
              tickLine={false}
              axisLine={false}
              minTickGap={16}
            />
            <YAxis
              tickFormatter={(v) => `${v / 1000000} M`}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              formatter={(v, nombre) => [formatear(v), nombre]}
              labelFormatter={etiquetaDia}
            />
            <Legend />
            <Line
              dataKey="historico"
              name="Histórico"
              stroke="#0f766e"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="proyeccion"
              name="Proyección"
              stroke="#b7791f"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <p className="mt-3 text-sm text-tinta-suave">
        Datos de ejemplo: aún no vienen del modelo.
      </p>
    </main>
  );
};

export default Predicciones;