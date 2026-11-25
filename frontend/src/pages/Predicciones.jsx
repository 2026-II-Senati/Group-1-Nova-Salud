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

const URL_PREDICCION = "http://localhost:3000/api/ml/prediccion";

// Escenario de demostración: ventas reales de los últimos 14 días del dataset
// Rossmann (del 2015-07-04 al 2015-07-17). No son ventas de Nova Salud.
const HISTORICO = [
  6054276, 269248, 7540473, 6393024, 6915625, 6938182, 7064909,
  6262022, 277047, 10841267, 9340405, 8756137, 8373873, 7949337,
];

// dia(0) = "2015-07-04", dia(1) = "2015-07-05", ... (el mes 6 es julio: JavaScript cuenta desde 0)
const dia = (n) => new Date(Date.UTC(2015, 6, 4 + n)).toISOString().slice(0, 10);

const FECHA_CORTE = dia(HISTORICO.length - 1); // último día con datos

// Puntos del gráfico que ya conocemos: el histórico
const PUNTOS_HISTORICO = HISTORICO.map((valor, i) => ({
  fecha: dia(i),
  historico: valor,
  // el último día real también inicia la línea punteada, para que ambas se unan
  proyeccion: i === HISTORICO.length - 1 ? valor : null,
}));

// "sáb 4"
const etiquetaDia = (fecha) =>
  new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
  });

// "sábado, 18 de julio de 2015"
const fechaLarga = (fecha) =>
  new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// "18 de julio de 2015"
const fechaCorta = (fecha) =>
  new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// 36296000 -> "36,296,000.00"
const formatear = (n) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// pandas cuenta lunes=0 ... domingo=6; JavaScript cuenta domingo=0 ... sábado=6
const diaSemanaModelo = (fecha) =>
  (new Date(`${fecha}T00:00:00`).getDay() + 6) % 7;

// Los 8 campos que espera POST /api/ml/prediccion para estimar el día `fecha`.
// `ventas` es la lista de ventas diarias conocidas hasta el día anterior.
const armarDatos = (ventas, fecha, { promo, vacaciones }) => ({
  ventas_ayer: ventas.at(-1),
  ventas_hace_7_dias: ventas.at(-7),
  promedio_7_dias: ventas.slice(-7).reduce((suma, v) => suma + v, 0) / 7,
  dia_semana: diaSemanaModelo(fecha),
  mes: Number(fecha.slice(5, 7)),
  dia_mes: Number(fecha.slice(8, 10)),
  Promo: promo,
  SchoolHoliday: vacaciones,
});

// Pide al backend la estimación de UN día. Si algo falla, lanza un Error con el
// mensaje listo para mostrar al usuario.
const pedirEstimacion = async (datos) => {
  let res;
  try {
    res = await fetch(URL_PREDICCION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(datos),
    });
  } catch (err) {
    throw new Error("No se pudo conectar con el servidor.", { cause: err });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Error del servidor.");
  return data;
};

const Predicciones = () => {
  // Supuestos del escenario: 1 = sí, 0 = no
  const [supuestos, setSupuestos] = useState({ promo: 0, vacaciones: 0 });
  const [horizonte, setHorizonte] = useState(null); // 1 = día siguiente, 7 = próxima semana
  const [resultado, setResultado] = useState(null); // { dias: [{ fecha, valor }], origen }
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Al cambiar un supuesto, el resultado anterior ya no corresponde: se borra
  const cambiarSupuesto = (campo, marcado) => {
    setSupuestos({ ...supuestos, [campo]: marcado ? 1 : 0 });
    setHorizonte(null);
    setResultado(null);
    setError("");
  };

  // Estima `cantidad` días seguidos. Cada estimación pasa a ser el "ayer" del
  // día siguiente, por eso se piden una detrás de otra.
  const consultar = async (cantidad) => {
    setHorizonte(cantidad);
    setCargando(true);
    setError("");
    setResultado(null);
    try {
      const ventas = [...HISTORICO];
      const dias = [];
      let origen = "";
      for (let i = 0; i < cantidad; i++) {
        const fecha = dia(HISTORICO.length + i);
        const data = await pedirEstimacion(armarDatos(ventas, fecha, supuestos));
        ventas.push(data.ventas_estimadas);
        dias.push({ fecha, valor: data.ventas_estimadas });
        origen = data.origen_datos;
      }
      setResultado({ dias, origen });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const dias = resultado ? resultado.dias : [];
  const total = dias.reduce((suma, d) => suma + d.valor, 0);
  const esSemana = dias.length > 1;

  // Con resultado, se agregan los días estimados al final de la línea punteada
  const serie = [
    ...PUNTOS_HISTORICO,
    ...dias.map((d) => ({ fecha: d.fecha, proyeccion: d.valor })),
  ];

    return (
    <main className="pagina">
      <h1 className="titulo-pagina">Predicciones de ventas</h1>

      <section className="panel mb-4 p-5">
        <h2 className="text-lg font-bold">Escenario</h2>
        <p className="mt-1 text-sm text-tinta-suave">
          Elige los supuestos. Se aplican a todos los días que estimes.
        </p>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              className="h-5 w-5 accent-botica"
              checked={supuestos.promo === 1}
              disabled={cargando}
              onChange={(e) => cambiarSupuesto("promo", e.target.checked)}
            />
            Hay promoción
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              className="h-5 w-5 accent-botica"
              checked={supuestos.vacaciones === 1}
              disabled={cargando}
              onChange={(e) => cambiarSupuesto("vacaciones", e.target.checked)}
            />
            Es feriado escolar
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            className={horizonte === 1 ? "btn btn-primario" : "btn btn-secundario"}
            onClick={() => consultar(1)}
            disabled={cargando}
          >
            {cargando && horizonte === 1 ? "Consultando..." : "Día siguiente"}
          </button>
          <button
            type="button"
            className={horizonte === 7 ? "btn btn-primario" : "btn btn-secundario"}
            onClick={() => consultar(7)}
            disabled={cargando}
          >
            {cargando && horizonte === 7 ? "Consultando..." : "Próxima semana"}
          </button>
        </div>
      </section>

      {error && (
        <p role="alert" className="mensaje-error mb-4">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-tinta-suave">
            {esSemana ? "Total estimado de la semana" : "Importe estimado"}
          </h2>
          <p className="mt-2 text-4xl font-bold tabular-nums text-botica">
            {resultado ? formatear(total) : "-"}
          </p>
          {esSemana && (
            <p className="mt-1 text-sm text-tinta-suave">
              Promedio diario: {formatear(total / dias.length)}
            </p>
          )}
        </section>

        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-tinta-suave">
            {esSemana ? "Días objetivo" : "Día objetivo"}
          </h2>
          <p className="mt-2 text-xl font-bold">
            {!resultado && "-"}
            {resultado && !esSemana && fechaLarga(dias[0].fecha)}
            {esSemana && `Del ${fechaCorta(dias[0].fecha)} al ${fechaCorta(dias.at(-1).fecha)}`}
          </p>
          <p className="mt-1 text-sm text-tinta-suave">
            Historial hasta el {fechaLarga(FECHA_CORTE)}
          </p>
        </section>

        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-tinta-suave">Origen de los datos</h2>
          <p className="mt-2 text-xl font-bold">
            {resultado ? resultado.origen : "-"}
          </p>
        </section>
      </div>

      <section className="panel mt-4 p-5">
        <h2 className="mb-4 text-lg font-bold">Histórico y estimación</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={serie} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
              name="Estimación"
              stroke="#b7791f"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <p className="mt-3 text-sm text-tinta-suave">
        Escenario de demostración con ventas del dataset Rossmann Store Sales. No es un
        pronóstico de las ventas de Nova Salud. La estimación de la semana se calcula día
        por día, usando cada estimación como dato del día siguiente, por lo que el error
        puede acumularse.
      </p>
    </main>
  );
};

export default Predicciones;