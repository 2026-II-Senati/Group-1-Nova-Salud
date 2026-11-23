# [PS2I-98] Reporte de Pruebas - Módulo de Predicción con Machine Learning

**Proyecto:** Nova Salud  
**Fecha:** 2026-11-23  
**Responsable:** Jeff Steven Gil Toribio

---

### Objetivo
Verificar el funcionamiento del endpoint de predicción de ventas (POST /api/ml/prediccion), su integración con el servicio de Machine Learning y el control de acceso según el rol del usuario autenticado.

---

### Entorno de la prueba

| Elemento | Detalle |
|----|----|
| Backend | Node.js + Express, puerto 3100 |
| Servicio de predicción | FastAPI (Python), puerto 8000 |
| Base de datos | MySQL en Aiven, base nova_salud |
| Cliente | Postman 12.37.4, colección prediccion-ml.postman_collection.json |
| Autorización | Token JWT en la cabecera Authorization |

La colección usa la variable baseUrl (http://localhost:3100) y guarda automáticamente los tokens en las variables tokenAdmin y tokenVendedor mediante scripts de prueba.

---

### CASOS DE PRUEBA EJECUTADOS

#### 1. Inicio de sesión del administrador
* **Acción:** POST /api/auth/login con admin@novasalud.com y su contraseña.
* **Esperado:** 200 con un token y los datos del usuario.
* **Resultado:** 200 OK. Devuelve el token y el usuario con rol_id 1. El token se guarda en tokenAdmin.
* **Estado:** Funcional

#### 2. Predicción con token de administrador
* **Acción:** POST /api/ml/prediccion con el token del administrador y los ocho campos del modelo.
* **Esperado:** 200 con el número de ventas estimadas.
* **Resultado:** 200 OK. Devuelve ventas_estimadas 9339682.29 y origen_datos «Rossmann Store Sales (escenario de demostración)».
* **Estado:** Funcional

#### 3. Inicio de sesión del vendedor
* **Acción:** POST /api/auth/login con vendedor@novasalud.com.
* **Esperado:** 200 con un token y rol_id 2.
* **Resultado:** 200 OK. Devuelve el usuario «Vendedor Prueba» con rol_id 2. El token se guarda en tokenVendedor.
* **Estado:** Funcional

#### 4. Predicción con token de vendedor
* **Acción:** POST /api/ml/prediccion con el token del vendedor.
* **Esperado:** 403 por falta de permisos.
* **Resultado:** 403 Forbidden con el mensaje «Solo un administrador puede consultar predicciones». El servicio de predicción no se llega a invocar.
* **Estado:** Funcional

#### 5. Predicción sin token
* **Acción:** POST /api/ml/prediccion sin cabecera de autorización.
* **Esperado:** 401 solicitando el token.
* **Resultado:** 401 Unauthorized con el mensaje «Token no proporcionado».
* **Estado:** Funcional

#### 6. Predicción con token inválido
* **Acción:** POST /api/ml/prediccion con un token manipulado.
* **Esperado:** 401 rechazando el token.
* **Resultado:** 401 Unauthorized con el mensaje «Token inválido o vencido». El mensaje es distinto al del caso 5, por lo que el sistema distingue un token ausente de uno inválido.
* **Estado:** Funcional

#### 7. Predicción con un campo faltante
* **Acción:** Enviar únicamente ventas_ayer, sin los otros siete campos.
* **Esperado:** 400 indicando qué campo falta.
* **Resultado:** 400 Bad Request con el mensaje «Falta el campo obligatorio: ventas_hace_7_dias». No se contacta al servicio de predicción.
* **Estado:** Funcional

#### 8. Predicción con un valor fuera de rango (Promo en 2)
* **Acción:** Enviar los ocho campos con Promo en 2, cuando el modelo solo admite 0 o 1.
* **Esperado:** 400 rechazando el valor.
* **Resultado:** 400 Bad Request con el mensaje «El campo Promo debe valer 0 o 1».
* **Estado:** Funcional

#### 9. Predicción con ventas negativas
* **Acción:** Enviar ventas_ayer en -5, valor imposible en ventas reales.
* **Esperado:** 400 rechazando el valor negativo.
* **Resultado:** 400 Bad Request con el mensaje «El campo ventas_ayer no puede ser negativo».
* **Estado:** Funcional

#### 10. Predicción con el servicio de Machine Learning apagado
* **Acción:** Detener el servicio de predicción del puerto 8000 y repetir el caso 2.
* **Esperado:** 503 informando que el servicio no está disponible, sin caída del backend.
* **Resultado:** 503 Service Unavailable con el mensaje «El servicio de predicción no está disponible en este momento». El backend sigue respondiendo normalmente y la base de datos no se ve afectada.
* **Estado:** Funcional

---

### Evidencias

Las capturas de cada caso están en docs/informe/img/:

| Caso | Archivo | Código |
|----|----|----|
| 1. Login administrador | postman-ps2i98-caso-01.jpeg | 200 |
| 2. Predicción con token de administrador | postman-ps2i98-caso-02.jpeg | 200 |
| 3. Login vendedor | postman-ps2i98-caso-03.jpeg | 200 |
| 4. Predicción con token de vendedor | postman-ps2i98-caso-04.jpeg | 403 |
| 5. Sin token | postman-ps2i98-caso-05.jpeg | 401 |
| 6. Token inválido | postman-ps2i98-caso-06.jpeg | 401 |
| 7. Campo faltante | postman-ps2i98-caso-07.jpeg | 400 |
| 8. Promo en 2 | postman-ps2i98-caso-08.jpeg | 400 |
| 9. Ventas negativas | postman-ps2i98-caso-09.jpeg | 400 |
| 10. Servicio apagado | postman-ps2i98-caso-10.jpeg | 503 |

---

### Defectos encontrados

**Defecto 1. El usuario vendedor no podía iniciar sesión.**

* **Descripción:** la petición de login con el correo vendedor@novasalud.com devolvía 401 con el mensaje «Credenciales inválidas», cuando el script database/nova_salud.sql incluye ese usuario con la misma contraseña que el administrador.
* **Causa:** el hash almacenado en la base de datos para el usuario de id 2 no correspondía a la contraseña esperada, mientras que el del administrador sí. La base en uso había quedado desalineada respecto al script del repositorio.
* **Corrección aplicada:** se actualizó el hash del usuario de id 2 en la base nova_salud. El inicio de sesión se comprobó de nuevo contra la API y responde 200.
* **Pendiente:** el INSERT de database/nova_salud.sql conserva el hash anterior, por lo que volver a ejecutar ese script reintroduciría el defecto. Conviene actualizarlo con el hash vigente.

---

### Conclusiones de Validación
* El endpoint de predicción responde correctamente con datos válidos y devuelve el valor que entrega el modelo.
* El control de acceso por rol funciona: el vendedor recibe 403 y el administrador 200 sobre el mismo endpoint.
* Los tres estados de autenticación se distinguen con mensajes propios: 401 sin token, 401 con token inválido y 403 con token válido sin permisos.
* La validación de entrada rechaza campos faltantes y valores fuera de rango con 400 y un mensaje que nombra el campo exacto.
* La caída del servicio de Machine Learning se degrada a 503 sin afectar al resto del backend.
* Los 10 casos de la colección quedan en estado funcional.
