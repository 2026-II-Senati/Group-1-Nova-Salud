/**
 * Helpers para que todas las rutas respondan con el mismo formato de error:
 *
 *   { "message": "..." }
 *
 * y con el codigo HTTP que corresponde: 400 (dato invalido del usuario),
 * 401 (sin autenticacion), 403 (sin permiso), 404 (no existe),
 * 503 (base caida) o 500 (fallo inesperado del servidor).
 *
 * Los errores de mysql2 se traducen a 400 cuando el dato enviado por el
 * usuario es el que los provoca, para que un dato invalido nunca salga 500.
 */

const MENSAJE_INTERNO = 'Error interno del servidor';

const errores = {
  // JSON mal formado en el body
  BAD_JSON: (req, res) => res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' }),

  // Comodin para rutas no registradas; se monta al final, despues de todas las rutas
  RUTA_NO_ENCONTRADA: (req, res) => res.status(404).json({ message: 'Ruta no encontrada' }),

  // Error no controlado en cualquier controlador
  INTERNO: (err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    console.error('Error no controlado:', err);
    return res.status(500).json({ message: MENSAJE_INTERNO });
  }
};

/**
 * Responde un error con el formato comun.
 * @param {import('express').Response} res
 * @param {number} status codigo HTTP
 * @param {string} message mensaje legible para el usuario
 */
const responderError = (res, status, message) => res.status(status).json({ message });

/**
 * Traduce un error de mysql2 a un codigo HTTP y un mensaje.
 * Devuelve null cuando el error NO es del usuario (fallo de conexion, bug),
 * para que el controlador responda 500.
 * @param {any} error
 * @returns {{status: number, message: string} | null}
 */
const traducirErrorBase = (error) => {
  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return { status: 400, message: 'El registro ya existe' };
    case 'ER_DATA_TOO_LONG':
      return { status: 400, message: 'Uno de los valores supera el largo permitido' };
    case 'ER_BAD_NULL_ERROR':
      return { status: 400, message: 'Falta un campo obligatorio' };
    case 'ER_NO_REFERENCED_ROW_2':
      return { status: 400, message: 'Uno de los identificadores enviados no existe' };
    case 'ER_ROW_IS_REFERENCED_2':
      return { status: 400, message: 'El registro tiene datos asociados y no se puede eliminar' };
    case 'ER_WRONG_VALUE_COUNT_ON_ROW':
    case 'ER_TRUNCATED_WRONG_VALUE':
    case 'ER_WRONG_VALUE':
      return { status: 400, message: 'Uno de los valores enviados no es válido' };
    case 'WARN_DATA_TRUNCATED':
      return { status: 400, message: 'Uno de los valores enviados no es válido' };
    case 'ER_NET_PACKET_TOO_LARGE':
      return { status: 400, message: 'El contenido enviado es demasiado grande' };
    case 'ER_ACCESS_DENIED_ERROR':
    case 'ECONNREFUSED':
    case 'ETIMEDOUT':
    case 'PROTOCOL_CONNECTION_LOST':
    case 'ENOTFOUND':
    case 'ER_CON_COUNT_ERROR':
      return { status: 503, message: 'No se pudo conectar con la base de datos' };
    default:
      return null;
  }
};

/**
 * Envuelve un controlador async para que cualquier excepcion (incluido un
 * TypeError por un body sin el tipo esperado) termine en responderError en vez
 * de tumbar la peticion con un 500 generico o colgar la solicitud.
 * @param {Function} controlador
 */
const asyncHandler = (controlador) => (req, res, next) =>
  Promise.resolve(controlador(req, res, next)).catch(next);

module.exports = { responderError, traducirErrorBase, asyncHandler, errores, MENSAJE_INTERNO };
