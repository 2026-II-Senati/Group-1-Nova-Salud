// Lee los datos del usuario desde el token guardado al iniciar sesión.
// Sirve para mostrar u ocultar cosas. La seguridad esta encargada en el backend.
export const leerSesion = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const cuerpo = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(cuerpo));
  } catch {
    return null;
  }
};

export const esAdmin = () => leerSesion()?.rol_id === 1;
