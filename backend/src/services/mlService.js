/**
 * Servicio de comunicacion con el microservicio de prediccion.
 *
 * El modelo entrenado (modelo.pkl) es de scikit-learn y solo se puede cargar
 * desde Python, no desde Node. Por eso el backend no abre el archivo: le pide
 * la prediccion por HTTP al servicio FastAPI que lo tiene cargado.
 *
 * Flujo completo:
 *
 *   React -> Express (este servicio envia la peticion) -> FastAPI -> modelo.pkl
 *
 * La URL del servicio se configura con ML_API_URL en el .env. Si no esta
 * definida se usa el valor por defecto, que es donde arranca api.py en local.
 */

const URL_PREDECIR =
  (process.env.ML_API_URL || 'http://127.0.0.1:8000') + '/predecir';

// Si el servicio no responde en este tiempo, se corta y se avisa al usuario.
const TIEMPO_LIMITE_MS = Number(process.env.ML_TIMEOUT_MS) || 8000;

/**
 * Envia los datos de un dia al microservicio y devuelve el importe estimado.
 *
 * @param {object} datos los 8 campos que espera el modelo
 * @returns {Promise<number>} el importe estimado
 * @throws {Error} con la propiedad `tipo` para que el controlador decida el
 *                 codigo HTTP: 'SERVICIO_CAIDO', 'TIEMPO_AGOTADO' o 'RESPUESTA_INVALIDA'
 */
const predecir = async (datos) => {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_LIMITE_MS);

  let respuesta;
  try {
    respuesta = await fetch(URL_PREDECIR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
      signal: controlador.signal,
    });
  } catch (error) {
    // fetch lanza excepcion cuando el puerto esta cerrado o se agota el tiempo.
    const deTiempo = error.name === 'AbortError';
    const fallo = new Error(
      deTiempo
        ? 'El servicio de prediccion no respondio a tiempo'
        : 'No se pudo conectar con el servicio de prediccion'
    );
    fallo.tipo = deTiempo ? 'TIEMPO_AGOTADO' : 'SERVICIO_CAIDO';
    fallo.causa = error;
    throw fallo;
  } finally {
    clearTimeout(temporizador);
  }

  if (!respuesta.ok) {
    // 422 es lo que devuelve FastAPI cuando los campos no encajan con el modelo.
    const fallo = new Error(
      respuesta.status === 422
        ? 'Los datos enviados al modelo no son validos'
        : 'El servicio de prediccion respondio con un error'
    );
    fallo.tipo = respuesta.status === 422 ? 'DATOS_INVALIDOS' : 'SERVICIO_CAIDO';
    fallo.status = respuesta.status;
    throw fallo;
  }

  let cuerpo;
  try {
    cuerpo = await respuesta.json();
  } catch (error) {
    const fallo = new Error('El servicio de prediccion devolvio una respuesta ilegible');
    fallo.tipo = 'RESPUESTA_INVALIDA';
    fallo.causa = error;
    throw fallo;
  }

  const ventas = cuerpo && cuerpo.ventas_estimadas;

  if (typeof ventas !== 'number' || !Number.isFinite(ventas)) {
    const fallo = new Error('El servicio de prediccion no devolvio un importe valido');
    fallo.tipo = 'RESPUESTA_INVALIDA';
    throw fallo;
  }

  return ventas;
};

module.exports = { predecir, URL_PREDECIR };
