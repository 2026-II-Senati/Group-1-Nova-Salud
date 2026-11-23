const { responderError, asyncHandler } = require('../utils/errors');
const mlService = require('../services/mlService');

// Campos que el modelo espera, con el tipo que exige el microservicio en Python.
// dia_semana sigue la convencion de pandas: lunes=0 ... domingo=6.
const CAMPOS_NUMERICOS = [
  'ventas_ayer',
  'ventas_hace_7_dias',
  'promedio_7_dias',
  'dia_semana',
  'mes',
  'dia_mes',
];
const CAMPOS_BINARIOS = ['Promo', 'SchoolHoliday'];

const esNumeroFinito = (valor) =>
  typeof valor === 'number' && Number.isFinite(valor);

/**
 * Valida el cuerpo de la peticion y devuelve los 8 campos limpios.
 * Devuelve { error } cuando algo no encaja, para que el controlador responda 400.
 */
const validarDatos = (cuerpo) => {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    return { error: 'El cuerpo de la petición debe ser un objeto JSON' };
  }

  const datos = {};

  for (const campo of CAMPOS_NUMERICOS) {
    if (!(campo in cuerpo)) {
      return { error: `Falta el campo obligatorio: ${campo}` };
    }
    if (!esNumeroFinito(cuerpo[campo])) {
      return { error: `El campo ${campo} debe ser un número` };
    }
    datos[campo] = cuerpo[campo];
  }

  for (const campo of CAMPOS_BINARIOS) {
    if (!(campo in cuerpo)) {
      return { error: `Falta el campo obligatorio: ${campo}` };
    }
    if (cuerpo[campo] !== 0 && cuerpo[campo] !== 1) {
      return { error: `El campo ${campo} debe valer 0 o 1` };
    }
    datos[campo] = cuerpo[campo];
  }

  // Los valores historicos no pueden ser negativos: no existen ventas negativas.
  for (const campo of ['ventas_ayer', 'ventas_hace_7_dias', 'promedio_7_dias']) {
    if (datos[campo] < 0) {
      return { error: `El campo ${campo} no puede ser negativo` };
    }
  }

  if (datos.dia_semana < 0 || datos.dia_semana > 6) {
    return { error: 'El campo dia_semana debe estar entre 0 (lunes) y 6 (domingo)' };
  }

  if (datos.mes < 1 || datos.mes > 12) {
    return { error: 'El campo mes debe estar entre 1 y 12' };
  }

  if (datos.dia_mes < 1 || datos.dia_mes > 31) {
    return { error: 'El campo dia_mes debe estar entre 1 y 31' };
  }

  return { datos };
};

/**
 * POST /api/ml/prediccion
 *
 * Recibe los 8 campos que necesita el modelo y devuelve el importe estimado.
 * El calculo lo hace el microservicio FastAPI (carpeta ml/): Node no puede
 * cargar el modelo.pkl porque es un objeto de scikit-learn.
 */
const predecir = asyncHandler(async (req, res) => {
  if (req.usuario.rol_id !== 1) {
    return responderError(res, 403, 'Solo un administrador puede consultar predicciones');
  }

  const { datos, error } = validarDatos(req.body);
  if (error) {
    return responderError(res, 400, error);
  }

  try {
    const ventasEstimadas = await mlService.predecir(datos);

    return res.json({
      ventas_estimadas: ventasEstimadas,
      origen_datos: 'Rossmann Store Sales (escenario de demostración)',
    });
  } catch (fallo) {
    if (fallo.tipo === 'DATOS_INVALIDOS') {
      return responderError(res, 400, fallo.message);
    }

    if (fallo.tipo === 'SERVICIO_CAIDO' || fallo.tipo === 'TIEMPO_AGOTADO') {
      console.error('Error en POST /api/ml/prediccion:', fallo.message);
      return responderError(
        res,
        503,
        'El servicio de predicción no está disponible en este momento'
      );
    }

    console.error('Error en POST /api/ml/prediccion:', fallo);
    return responderError(res, 502, 'El servicio de predicción devolvió una respuesta inválida');
  }
});

module.exports = { predecir };
