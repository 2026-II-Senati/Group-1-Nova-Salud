import { useEffect, useState } from "react";

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/alertas")
      .then(async (res) => {
        if (!res.ok) throw new Error("Error del servidor");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Respuesta inválida");
        setAlertas(data);
      })
      .catch((err) => {
        console.error("Error al cargar las alertas:", err);
        setError("No se pudo conectar con el servidor.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="pagina text-tinta-suave">Cargando alertas...</p>;
  if (error)
    return (
      <main className="pagina">
        <p role="alert" className="mensaje-error">
          Error: {error}
        </p>
      </main>
    );

  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Alertas de stock</h1>

      {alertas.length === 0 ? (
        <p role="status" className="mensaje-ok py-6 text-center text-lg">
          Todo en orden
        </p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla min-w-[420px]">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col" className="num">
                  Stock actual
                </th>
                <th scope="col" className="num">
                  Stock mínimo
                </th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((a) => (
                <tr key={a.id} className="fila-alerta">
                  <td>{a.nombre}</td>
                  <td className="num">{a.stock}</td>
                  <td className="num">{a.stock_minimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default Alertas;
