import { useEffect, useState } from "react";
import { leerSesion } from "../services/sesion";

const API = "http://localhost:3000/api";

const cabeceras = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const mensajeHttp = (res) => {
  if (res.status === 401) return "Tu sesión venció. Vuelve a iniciar sesión.";
  if (res.status === 403) return "No tienes permiso para esta acción.";
  return "Error del servidor.";
};

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [cambiandoId, setCambiandoId] = useState(null);
  const miId = leerSesion()?.id;

  useEffect(() => {
    Promise.all([
      fetch(`${API}/usuarios`, { headers: cabeceras() }),
      fetch(`${API}/roles`),
    ])
      .then(async ([resUsuarios, resRoles]) => {
        if (!resUsuarios.ok) throw new Error(mensajeHttp(resUsuarios));
        if (!resRoles.ok) throw new Error("Error del servidor.");
        const dataUsuarios = await resUsuarios.json();
        const dataRoles = await resRoles.json();
        if (!Array.isArray(dataUsuarios) || !Array.isArray(dataRoles))
          throw new Error("Respuesta inválida.");
        setUsuarios(dataUsuarios);
        setRoles(dataRoles);
      })
      .catch((err) => {
        console.error("Error al cargar los usuarios:", err);
        setErrorCarga(
          err instanceof TypeError
            ? "No se pudo conectar con el servidor."
            : err.message,
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const nombreRol = (id) => roles.find((r) => r.id === id)?.nombre ?? "Sin rol";

  const cambiarEstado = async (u) => {
    const activar = !u.activo;
    if (
      !activar &&
      !window.confirm(`¿Desactivar a "${u.nombre}"? No podrá iniciar sesión.`)
    )
      return;

    setCambiandoId(u.id);
    setErrorAccion("");
    try {
      const res = await fetch(`${API}/usuarios/${u.id}/estado`, {
        method: "PUT",
        headers: cabeceras(),
        body: JSON.stringify({ activo: activar }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || mensajeHttp(res));
      setUsuarios((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, activo: data.activo } : x)),
      );
    } catch (err) {
      setErrorAccion(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor."
          : err.message,
      );
    } finally {
      setCambiandoId(null);
    }
  };

  if (loading)
    return (
      <main className="pagina">
        <p className="text-tinta-suave">Cargando usuarios...</p>
      </main>
    );

  if (errorCarga)
    return (
      <main className="pagina">
        <p role="alert" className="mensaje-error">
          Error: {errorCarga}
        </p>
      </main>
    );

  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Gestión de usuarios</h1>

      {errorAccion && (
        <p role="alert" className="mensaje-error mb-5">
          {errorAccion}
        </p>
      )}

      <div className="tabla-contenedor">
        <table className="tabla min-w-[640px]">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Correo</th>
              <th scope="col">Rol</th>
              <th scope="col">Estado</th>
              <th scope="col">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const activo = Boolean(u.activo);
              const esYo = u.id === miId;
              return (
                <tr key={u.id}>
                  <td className="font-semibold">
                    {u.nombre}
                    {esYo && (
                      <span className="ml-2 text-sm font-normal text-tinta-suave">
                        (tú)
                      </span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td className="capitalize">{nombreRol(u.rol_id)}</td>
                  <td>
                    <span
                      className={`rounded-full px-2.5 py-1 text-sm font-semibold ${
                        activo
                          ? "bg-botica-suave text-botica-oscuro"
                          : "bg-alerta-suave text-alerta"
                      }`}
                    >
                      {activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => cambiarEstado(u)}
                      disabled={esYo || cambiandoId === u.id}
                      title={
                        esYo ? "No puedes desactivar tu propia cuenta" : undefined
                      }
                      aria-label={`${activo ? "Desactivar" : "Activar"} a ${u.nombre}`}
                      className={`btn btn-chico ${activo ? "btn-peligro" : "btn-primario"}`}
                    >
                      {cambiandoId === u.id
                        ? "Guardando..."
                        : activo
                          ? "Desactivar"
                          : "Activar"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-tinta-suave">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Usuarios;